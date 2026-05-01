import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaystackService } from '../payments/paystack.service';
import { FlutterwaveService } from '../payments/flutterwave.service';
import { ChatGateway } from '../chat/chat.gateway';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import {
  PaymentMethod,
  PayoutStatus,
  PayoutTrigger,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly flutterwave: FlutterwaveService,
    private readonly chatGateway: ChatGateway,
    private readonly platformSettings: PlatformSettingsService,
  ) {}

  /**
   * Commission rate for the platform. Captured at payout-creation time onto
   * the Payout row so historical payouts don't change if the rate is
   * adjusted later. Reads from the PlatformSettings table (admin-editable).
   */
  private async commissionRate(): Promise<number> {
    const settings = await this.platformSettings.get();
    const rate = settings.commissionRate;
    if (!Number.isFinite(rate) || rate < 0 || rate >= 1) return 0.1;
    return rate;
  }

  /** Round to 2 decimals (currency precision). */
  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  /**
   * Called by booking.service.confirmArrival when the traveler clicks
   * "I have arrived". Creates a Payout row in PENDING. If the transporter
   * has a Paystack recipient on file AND PAYSTACK_AUTO_PAYOUT=true, also
   * attempts to release immediately. Otherwise the admin has to release
   * manually from /admin/payouts.
   *
   * Idempotent: re-calling for the same booking is a no-op (the @@unique
   * on bookingId raises a P2002 we swallow).
   */
  async createForBooking(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transport: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                payoutProvider: true,
                paystackRecipientCode: true,
                bankCode: true,
                bankAccountNumber: true,
                flwBankCode: true,
                flwBankAccountNumber: true,
              },
            },
          },
        },
        // The PAID Payment row tells us which provider actually moved the
        // money. We release through THAT provider so money-in matches
        // money-out and we don't drift between Paystack and Flutterwave
        // balances. Multiple payments are possible on retry; pick the
        // PAID one (there's at most one per booking once payment lands).
        payments: {
          where: { status: PaymentStatus.PAID },
          orderBy: { paidAt: 'desc' },
          take: 1,
          select: { provider: true },
        },
      },
    });
    if (!booking) return;
    if (booking.paymentStatus !== PaymentStatus.PAID) return;

    const settings = await this.platformSettings.get();
    const rate = settings.commissionRate;
    const gross = Number(booking.totalPrice);
    const commission = this.round(gross * rate);
    const net = this.round(gross - commission);

    try {
      const payout = await this.prisma.payout.create({
        data: {
          bookingId: booking.id,
          transporterId: booking.transport.transporterId,
          grossAmount: gross,
          commissionRate: rate,
          commissionAmount: commission,
          netAmount: net,
          currency: booking.transport.currency,
          status: PayoutStatus.PENDING,
          paystackRecipientCode: booking.transport.transporter.paystackRecipientCode,
        },
      });

      // Release-side provider is dictated by the payment-side provider —
      // money goes back out through the same provider's account it came
      // in through. Falls back to the transporter's preferred provider
      // (legacy/fallback) when no PAID payment is recorded yet, which
      // shouldn't happen since paymentStatus === PAID was just checked.
      const transporter = booking.transport.transporter;
      const paidViaProvider =
        booking.payments[0]?.provider ?? transporter.payoutProvider ?? PaymentMethod.PAYSTACK;
      const hasPayoutAccount =
        paidViaProvider === PaymentMethod.FLUTTERWAVE
          ? !!(transporter.flwBankCode && transporter.flwBankAccountNumber)
          : !!transporter.paystackRecipientCode;

      const auto = settings.autoPayoutEnabled;
      if (auto && hasPayoutAccount) {
        // Fire-and-forget; don't block the user's "I've arrived" click on
        // a slow provider call. Errors are logged + visible on the payout row.
        // Pass the resolved provider explicitly so attemptRelease doesn't
        // fall back to the transporter's "preferred" setting (which might
        // disagree with the payment provider).
        this.attemptRelease(payout.id, PayoutTrigger.AUTO, paidViaProvider).catch((err) => {
          this.logger.error(`Auto-payout failed for ${payout.id}`, err as Error);
        });
      } else if (auto && !hasPayoutAccount) {
        // Auto is on but the transporter never configured their payout
        // bank — log so the admin sees why the payout sat PENDING.
        this.logger.warn(
          `Auto-payout skipped for payout ${payout.id}: transporter ${transporter.id} has no ${paidViaProvider} payout account configured`,
        );
      }
    } catch (err) {
      // P2002 on bookingId means a payout for this booking already exists —
      // ignore. Anything else, log + continue (the booking is still completed).
      const code = (err as { code?: string }).code;
      if (code !== 'P2002') {
        this.logger.error(`Could not create payout for booking ${bookingId}`, err as Error);
      }
    }
  }

  /**
   * Attempt to release a PENDING payout. Dispatches to Paystack or
   * Flutterwave based on the transporter's payoutProvider. Sets PROCESSING
   * on a successful API call (the provider's success webhook flips it to
   * RELEASED later, or the API returns "success" right away in test mode).
   * On API failure, marks FAILED with the reason.
   *
   * `trigger` records why this release fired (AUTO from arrival confirmation
   * vs MANUAL from /admin/payouts) — written on the first PROCESSING
   * transition so the admin UI can show whose decision it was. Persists
   * across retries so re-attempting an AUTO release stays AUTO, not MANUAL.
   *
   * Idempotency: we generate a stable `reference` per payout so retrying
   * after a network hiccup hits the same transfer at the provider.
   */
  async attemptRelease(payoutId: string, trigger: PayoutTrigger, providerOverride?: PaymentMethod): Promise<void> {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        transporter: {
          select: {
            id: true,
            name: true,
            payoutProvider: true,
            paystackRecipientCode: true,
            bankCode: true,
            bankAccountNumber: true,
            flwBankCode: true,
            flwBankAccountNumber: true,
          },
        },
        booking: {
          // Pull the most recent PAID payment for this booking so a manual
          // admin release also sends through the same provider the booking
          // was charged on. Avoids a Paystack-paid booking accidentally
          // releasing from the Flutterwave balance.
          select: {
            payments: {
              where: { status: PaymentStatus.PAID },
              orderBy: { paidAt: 'desc' },
              take: 1,
              select: { provider: true },
            },
          },
        },
      },
    });
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status === PayoutStatus.RELEASED) {
      return; // already done
    }

    // Provider resolution priority:
    //   1. Explicit override from createForBooking (knows the exact PAID
    //      payment provider).
    //   2. The booking's PAID payment provider (admin manual-release
    //      path — looked up here).
    //   3. The payout row's own provider snapshot (set on the first attempt).
    //   4. The transporter's preferred payoutProvider (legacy fallback).
    //   5. PAYSTACK as a last resort.
    const provider =
      providerOverride ??
      payout.booking.payments[0]?.provider ??
      payout.provider ??
      payout.transporter.payoutProvider ??
      PaymentMethod.PAYSTACK;

    const reference =
      payout.paystackTransferReference ??
      `smatway_payout_${payout.id.replace(/-/g, '').slice(0, 16)}_${crypto
        .randomBytes(4)
        .toString('hex')}`;

    if (provider === PaymentMethod.PAYSTACK) {
      if (!payout.transporter.paystackRecipientCode) {
        await this.prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.FAILED,
            failedAt: new Date(),
            failureReason: 'Transporter has no Paystack recipient on file',
          },
        });
        throw new BadRequestException(
          'Transporter has no payout account configured. Ask them to add their bank details.',
        );
      }

      // Mark PROCESSING + persist the reference BEFORE the API call so a retry
      // uses the same reference (Paystack treats it as idempotent). Lock in
      // the original trigger if this row was already touched once — a retry
      // on a previously-AUTO release shouldn't get re-tagged as MANUAL.
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PROCESSING,
          provider: PaymentMethod.PAYSTACK,
          paystackTransferReference: reference,
          paystackRecipientCode: payout.transporter.paystackRecipientCode,
          releaseTrigger:
            (payout as unknown as { releaseTrigger: PayoutTrigger | null }).releaseTrigger ?? trigger,
        },
      });

      try {
        // Dev bypass: when the recipient was created via
        // PAYSTACK_DEV_BYPASS_BANK_VERIFICATION, the recipient code is a local
        // synthetic value that Paystack doesn't know about. Simulate a
        // successful transfer so the admin can complete the test loop without
        // a real bank account on file.
        const isDevRecipient =
          payout.transporter.paystackRecipientCode.startsWith('DEV_RCP_');

        const result = isDevRecipient
          ? {
              status: 'success' as const,
              transferCode: `DEV_TRF_${reference}`,
              raw: { simulated: true, reason: 'PAYSTACK_DEV_BYPASS recipient' },
            }
          : await this.paystack.initiateTransfer({
              amount: Number(payout.netAmount),
              recipientCode: payout.transporter.paystackRecipientCode,
              currency: payout.currency,
              reference,
              reason: `SmatWay payout · booking ${payout.bookingId.slice(0, 8)}`,
            });
        if (isDevRecipient) {
          this.logger.warn(
            `[DEV BYPASS] Simulated Paystack transfer for payout ${payoutId}. No real money moved.`,
          );
        }
        const isSuccess = result.status === 'success';
        await this.prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: isSuccess ? PayoutStatus.RELEASED : PayoutStatus.PROCESSING,
            paystackTransferCode: result.transferCode,
            releasedAt: isSuccess ? new Date() : null,
            rawResponse: {
              ...((payout.rawResponse as object) ?? {}),
              transfer: result.raw as Prisma.InputJsonValue,
            } as Prisma.InputJsonValue,
          },
        });

        this.notifyPayout(payout.transporterId, payout, isSuccess);
        return;
      } catch (err) {
        await this.markFailedAfterAttempt(payoutId, err);
        throw err;
      }
    }

    // ─── Flutterwave path ──────────────────────────────────────────────────
    if (provider === PaymentMethod.FLUTTERWAVE) {
      // Flutterwave bank details now live in their own columns so they
      // can coexist with a separately-configured Paystack account on the
      // same transporter. The legacy `bankCode/bankAccountNumber` columns
      // are now Paystack-only.
      const flwBankCode = payout.transporter.flwBankCode;
      const flwAccountNumber = payout.transporter.flwBankAccountNumber;
      if (!flwBankCode || !flwAccountNumber) {
        await this.prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.FAILED,
            failedAt: new Date(),
            failureReason: 'Transporter has no Flutterwave bank details on file',
          },
        });
        throw new BadRequestException(
          'Transporter has no payout account configured. Ask them to add their bank details.',
        );
      }

      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PROCESSING,
          provider: PaymentMethod.FLUTTERWAVE,
          paystackTransferReference: reference, // reused as the cross-provider idempotency ref
          releaseTrigger:
            (payout as unknown as { releaseTrigger: PayoutTrigger | null }).releaseTrigger ?? trigger,
        },
      });

      try {
        // Dev bypass: same idea as Paystack — if the recipient code marker is
        // DEV_RCP_, simulate the Flutterwave transfer so testing can complete.
        const isDevRecipient =
          (payout.transporter.paystackRecipientCode ?? '').startsWith('DEV_RCP_') ||
          process.env.PAYSTACK_DEV_BYPASS_BANK_VERIFICATION === 'true';

        const result = isDevRecipient
          ? {
              status: 'NEW' as const,
              transferId: null as number | null,
              raw: { simulated: true, reason: 'DEV bypass — no real Flutterwave call' },
            }
          : await this.flutterwave.initiateTransfer({
              amount: Number(payout.netAmount),
              currency: payout.currency,
              bankCode: flwBankCode,
              accountNumber: flwAccountNumber,
              reference,
              narration: `SmatWay payout · booking ${payout.bookingId.slice(0, 8)}`,
            });
        if (isDevRecipient) {
          this.logger.warn(
            `[DEV BYPASS] Simulated Flutterwave transfer for payout ${payoutId}. No real money moved.`,
          );
        }
        // Flutterwave transfer statuses: NEW (queued), SUCCESSFUL, FAILED.
        // In test mode it usually stays NEW until the webhook lands; for a
        // simulated dev bypass we flip straight to RELEASED so the demo
        // completes end-to-end.
        const isSuccess = isDevRecipient || result.status === 'SUCCESSFUL';
        await this.prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: isSuccess ? PayoutStatus.RELEASED : PayoutStatus.PROCESSING,
            flwTransferId: result.transferId ?? null,
            releasedAt: isSuccess ? new Date() : null,
            rawResponse: {
              ...((payout.rawResponse as object) ?? {}),
              transfer: result.raw as Prisma.InputJsonValue,
            } as Prisma.InputJsonValue,
          },
        });

        this.notifyPayout(payout.transporterId, payout, isSuccess);
        return;
      } catch (err) {
        await this.markFailedAfterAttempt(payoutId, err);
        throw err;
      }
    }

    throw new BadRequestException(`Unsupported payout provider: ${provider}`);
  }

  /** Internal helper: mark payout FAILED with a friendly reason after an exception. */
  private async markFailedAfterAttempt(payoutId: string, err: unknown): Promise<void> {
    const message = err instanceof Error ? err.message : 'Transfer failed';
    await this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.FAILED,
        failedAt: new Date(),
        failureReason: message,
      },
    });
  }

  /** Internal helper: dispatch the payout-status notification to the transporter. */
  private notifyPayout(
    transporterId: string,
    payout: { id: string; bookingId: string; netAmount: Prisma.Decimal | number; currency: string },
    isReleased: boolean,
  ): void {
    try {
      this.chatGateway.notifyUser(transporterId, {
        type: isReleased ? 'payout_released' : 'payout_processing',
        payoutId: payout.id,
        bookingId: payout.bookingId,
        netAmount: Number(payout.netAmount),
        currency: payout.currency,
      });
    } catch (notifyErr) {
      this.logger.warn(
        `Could not push payout notification: ${(notifyErr as Error).message}`,
      );
    }
  }

  /** Re-verify a PROCESSING payout against Paystack — used for reconciliation. */
  async reconcile(payoutId: string): Promise<PayoutStatus> {
    const payout = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException();
    if (!payout.paystackTransferReference) return payout.status;
    if (payout.status === PayoutStatus.RELEASED) return payout.status;

    const result = await this.paystack.verifyTransfer(payout.paystackTransferReference);
    // We already early-returned if payout.status === RELEASED above, so this
    // branch is reachable only when the row is still PENDING/PROCESSING/FAILED.
    if (result.status === 'success') {
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.RELEASED,
          releasedAt: new Date(),
          rawResponse: {
            ...((payout.rawResponse as object) ?? {}),
            verify: result.raw as Prisma.InputJsonValue,
          } as Prisma.InputJsonValue,
        },
      });
      return PayoutStatus.RELEASED;
    }
    if (result.status === 'failed' && payout.status !== PayoutStatus.FAILED) {
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FAILED,
          failedAt: new Date(),
          failureReason: 'Transfer reported failed by Paystack',
        },
      });
      return PayoutStatus.FAILED;
    }
    return payout.status;
  }

  // ─── Bank account / recipient setup (transporter-side) ────────────────────

  /**
   * Bank list. Defaults to Paystack for backward compat. Pass provider=FLUTTERWAVE
   * to fetch Flutterwave's bank list (different format / coverage).
   *
   * For Flutterwave the input is an ISO-2 country code (NG, GH, KE…), not
   * a currency. We translate currency → country to keep the frontend simple.
   */
  async listBanks(
    currencyOrCountry: string = 'NGN',
    provider: PaymentMethod = PaymentMethod.PAYSTACK,
  ) {
    if (process.env.PAYSTACK_DEV_BYPASS_BANK_VERIFICATION === 'true') {
      return {
        banks: [
          { name: 'Dev Bank Alpha', code: 'DEV001', longcode: 'DEV000001' },
          { name: 'Dev Bank Beta',  code: 'DEV002', longcode: 'DEV000002' },
          { name: 'Dev Bank Gamma', code: 'DEV003', longcode: 'DEV000003' },
        ],
      };
    }
    if (provider === PaymentMethod.FLUTTERWAVE) {
      const country = currencyToCountryCode(currencyOrCountry);
      const banks = await this.flutterwave.listBanks(country);
      return { banks };
    }
    const banks = await this.paystack.listBanks(currencyOrCountry);
    return { banks };
  }

  async resolveAccount(
    accountNumber: string,
    bankCode: string,
    provider: PaymentMethod = PaymentMethod.PAYSTACK,
  ) {
    if (process.env.PAYSTACK_DEV_BYPASS_BANK_VERIFICATION === 'true') {
      // Dev only: skip the provider call and synthesise a name so the live
      // preview + Save button both work without depending on the provider's
      // (sometimes flaky) test resolver.
      return {
        accountName: `Dev Account ${accountNumber.slice(-4)}`,
        accountNumber,
      };
    }
    if (provider === PaymentMethod.FLUTTERWAVE) {
      return this.flutterwave.resolveAccount(accountNumber, bankCode);
    }
    return this.paystack.resolveAccount(accountNumber, bankCode);
  }

  /**
   * Transporter saves their bank account details. We resolve the account
   * with the chosen provider (so we know the legal account name), then —
   * for Paystack only — create a transfer recipient and store the
   * recipient_code on the User row. Flutterwave doesn't use a recipient
   * concept; for FLW we just store bank+account and pass them on every
   * transfer call.
   *
   * Dev bypass: PAYSTACK_DEV_BYPASS_BANK_VERIFICATION=true skips the resolve
   * + recipient creation and stores the user-supplied details as-is. Lets
   * local development testing proceed when the provider's test resolver
   * doesn't cooperate (their test mode is inconsistent about which fake
   * account numbers succeed). NEVER set this in production — it lets a
   * transporter point payouts at a bank account they don't actually own.
   */
  async setPayoutAccount(transporterId: string, input: {
    bankCode: string;
    accountNumber: string;
    currency: string;
    provider?: PaymentMethod;
  }) {
    const cleanAccount = input.accountNumber.replace(/\s+/g, '');
    if (!/^\d{6,20}$/.test(cleanAccount)) {
      throw new BadRequestException('Account number must be 6–20 digits');
    }

    const provider = input.provider ?? PaymentMethod.PAYSTACK;
    const devBypass = process.env.PAYSTACK_DEV_BYPASS_BANK_VERIFICATION === 'true';

    let accountName: string;
    let recipientCode: string | null = null;

    if (devBypass) {
      this.logger.warn(
        `[DEV BYPASS] Skipping ${provider} bank verification for transporter ${transporterId}. Real transfers WILL fail.`,
      );
      accountName = `Dev Account ${cleanAccount.slice(-4)}`;
      if (provider === PaymentMethod.PAYSTACK) {
        recipientCode = `DEV_RCP_${cleanAccount}`;
      }
    } else if (provider === PaymentMethod.FLUTTERWAVE) {
      const resolved = await this.flutterwave.resolveAccount(cleanAccount, input.bankCode);
      accountName = resolved.accountName;
      // Flutterwave doesn't have recipients — leave paystackRecipientCode null.
    } else {
      const resolved = await this.paystack.resolveAccount(cleanAccount, input.bankCode);
      const recipient = await this.paystack.createTransferRecipient({
        name: resolved.accountName,
        accountNumber: cleanAccount,
        bankCode: input.bankCode,
        currency: input.currency,
      });
      accountName = resolved.accountName;
      recipientCode = recipient.recipientCode;
    }

    // Provider-scoped write: only touch the columns belonging to the
    // provider being configured. Saves the OTHER provider's existing
    // configuration intact so a transporter can keep both connected at
    // the same time.
    const data: Record<string, unknown> = { payoutProvider: provider };
    if (provider === PaymentMethod.FLUTTERWAVE) {
      data.flwBankCode = input.bankCode;
      data.flwBankAccountNumber = cleanAccount;
      data.flwBankAccountName = accountName;
    } else {
      data.bankCode = input.bankCode;
      data.bankAccountNumber = cleanAccount;
      data.bankAccountName = accountName;
      data.paystackRecipientCode = recipientCode;
    }

    const user = await this.prisma.user.update({
      where: { id: transporterId },
      data,
      select: {
        bankCode: true,
        bankAccountNumber: true,
        bankAccountName: true,
        paystackRecipientCode: true,
        flwBankCode: true,
        flwBankAccountNumber: true,
        flwBankAccountName: true,
        payoutProvider: true,
      },
    });
    const configuredProviders: PaymentMethod[] = [];
    if (user.paystackRecipientCode) configuredProviders.push(PaymentMethod.PAYSTACK);
    if (user.flwBankCode && user.flwBankAccountNumber) configuredProviders.push(PaymentMethod.FLUTTERWAVE);
    return { ...user, configuredProviders };
  }

  /**
   * Disconnect one provider's payout account, leaving the other intact.
   * Clears only the columns belonging to the requested provider so a
   * transporter who wanted "Paystack only" can drop Flutterwave (and
   * vice versa) without re-entering the rail they want to keep.
   *
   * Note: on the Paystack side this leaves the actual transfer-recipient
   * orphaned in Paystack's dashboard (their API has no recipient-delete
   * endpoint that's safe to call from automated code). That's harmless —
   * the recipient just stops being referenced from our side.
   */
  async removePayoutAccount(transporterId: string, provider: PaymentMethod) {
    const data: Record<string, unknown> = {};
    if (provider === PaymentMethod.FLUTTERWAVE) {
      data.flwBankCode = null;
      data.flwBankAccountNumber = null;
      data.flwBankAccountName = null;
    } else {
      data.bankCode = null;
      data.bankAccountNumber = null;
      data.bankAccountName = null;
      data.paystackRecipientCode = null;
    }
    const user = await this.prisma.user.update({
      where: { id: transporterId },
      data,
      select: {
        bankCode: true,
        bankAccountNumber: true,
        bankAccountName: true,
        paystackRecipientCode: true,
        flwBankCode: true,
        flwBankAccountNumber: true,
        flwBankAccountName: true,
        payoutProvider: true,
      },
    });
    const configuredProviders: PaymentMethod[] = [];
    if (user.paystackRecipientCode) configuredProviders.push(PaymentMethod.PAYSTACK);
    if (user.flwBankCode && user.flwBankAccountNumber) configuredProviders.push(PaymentMethod.FLUTTERWAVE);
    return { ...user, configuredProviders };
  }

  /**
   * Returns the full set of payout configuration for both providers, plus
   * a derived `configuredProviders` array so the frontend can render the
   * status pill per provider without re-implementing the "is it set up"
   * check in two places.
   */
  async getPayoutAccount(transporterId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: transporterId },
      select: {
        bankCode: true,
        bankAccountNumber: true,
        bankAccountName: true,
        paystackRecipientCode: true,
        flwBankCode: true,
        flwBankAccountNumber: true,
        flwBankAccountName: true,
        payoutProvider: true,
      },
    });
    if (!user) throw new NotFoundException();
    const configuredProviders: PaymentMethod[] = [];
    if (user.paystackRecipientCode) configuredProviders.push(PaymentMethod.PAYSTACK);
    if (user.flwBankCode && user.flwBankAccountNumber) configuredProviders.push(PaymentMethod.FLUTTERWAVE);
    return { ...user, configuredProviders };
  }

  // ─── Listing ─────────────────────────────────────────────────────────────

  async listMine(transporterId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { transporterId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            transport: { select: { id: true, departureCity: true, destinationCity: true } },
          },
        },
      },
    });
    return { payouts };
  }

  async listAll(params: { status?: PayoutStatus; limit?: number; cursor?: string } = {}) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const items = await this.prisma.payout.findMany({
      where: { ...(params.status ? { status: params.status } : {}) },
      take: limit + 1,
      ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        transporter: {
          select: { id: true, name: true, email: true, paystackRecipientCode: true },
        },
        booking: {
          include: {
            transport: { select: { id: true, departureCity: true, destinationCity: true } },
          },
        },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      payouts: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  /** Admin-side enforcement of release. Tags the payout as MANUAL so the
   *  audit trail / payouts table can show it was a human decision. */
  async adminRelease(payoutId: string) {
    return this.attemptRelease(payoutId, PayoutTrigger.MANUAL);
  }

  async adminMarkFailed(payoutId: string, reason: string) {
    const payout = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException();
    if (payout.status === PayoutStatus.RELEASED) {
      throw new ForbiddenException('Cannot fail a payout that has already been released');
    }
    return this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.FAILED,
        failedAt: new Date(),
        failureReason: reason,
      },
    });
  }
}

/**
 * Translate ISO 4217 currency → ISO-2 country for Flutterwave's bank list
 * endpoint (it expects /banks/<country>, not /banks?currency=…). Defaults
 * to NG so the test sandbox always returns something.
 */
function currencyToCountryCode(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'NGN': return 'NG';
    case 'GHS': return 'GH';
    case 'KES': return 'KE';
    case 'UGX': return 'UG';
    case 'TZS': return 'TZ';
    case 'ZAR': return 'ZA';
    case 'ZMW': return 'ZM';
    case 'EGP': return 'EG';
    case 'XAF': return 'CM';
    case 'XOF': return 'SN';
    default:    return 'NG';
  }
}
