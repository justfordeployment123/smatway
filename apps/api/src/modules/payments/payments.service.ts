import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaystackService } from './paystack.service';
import { FlutterwaveService } from './flutterwave.service';
import { ChatGateway } from '../chat/chat.gateway';
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import * as crypto from 'crypto';

/**
 * Currency → Flutterwave `payment_options` rail string. Each entry steers
 * the hosted checkout toward the locally familiar method first (M-Pesa for
 * KES, mobile money in Ghana/Uganda/Rwanda/Tanzania/Zambia/Francophone) and
 * keeps `card` as a fallback. Currencies that aren't listed fall through to
 * Flutterwave's default (all enabled methods on the account).
 *
 * NB: keep this in sync with the per-currency provider visibility on the
 * web /pay page — the two should agree on which rails make sense where.
 */
const FLUTTERWAVE_PAYMENT_OPTIONS_BY_CURRENCY: Record<string, string> = {
  KES: 'mpesa,card',
  GHS: 'mobilemoneyghana,card',
  UGX: 'mobilemoneyuganda,card',
  RWF: 'mobilemoneyrwanda,card',
  TZS: 'mobilemoneytanzania,card',
  ZMW: 'mobilemoneyzambia,card',
  XOF: 'mobilemoneyfranco,card',
  NGN: 'card,banktransfer,ussd',
  ZAR: 'card',
  USD: 'card',
};

function flutterwavePaymentOptionsFor(currency: string): string | undefined {
  return FLUTTERWAVE_PAYMENT_OPTIONS_BY_CURRENCY[currency.toUpperCase()];
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly flutterwave: FlutterwaveService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Initialize payment for a booking via Paystack.
   *
   * Flow:
   * 1. Verify booking exists, belongs to the calling user, and isn't already paid.
   * 2. Create a Payment row in PENDING status (so the webhook has something to find).
   * 3. Call Paystack /transaction/initialize.
   * 4. Return the authorization URL to the frontend, which redirects the user.
   */
  async initializePaystack(travelerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        traveler: { select: { id: true, email: true, name: true } },
        transport: { select: { currency: true, departureCity: true, destinationCity: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is cancelled');
    }
    // Platform rule: payment unlocks only after the transporter accepts the
    // booking. Stops travelers paying for a trip that the driver hasn't
    // agreed to and avoids automatic refunds when a route is rejected.
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Payment will unlock once the transporter confirms your booking.',
      );
    }

    const reference = `smatway_${booking.id.replace(/-/g, '').slice(0, 20)}_${crypto
      .randomBytes(6)
      .toString('hex')}`;

    // Create the Payment row first so the webhook can match before the
    // initialize call returns (rare race, but real).
    const amount = Number(booking.totalPrice);
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: PaymentMethod.PAYSTACK,
        reference,
        amount,
        currency: booking.transport.currency,
        status: PaymentStatus.PENDING,
      },
    });

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ?? 'http://localhost:3000/dashboard/pay/callback';

    const result = await this.paystack.initializeTransaction({
      email: booking.traveler.email,
      amount,
      currency: booking.transport.currency,
      reference,
      callbackUrl,
      metadata: {
        bookingId: booking.id,
        travelerId,
        route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
      },
    });

    // Save the init response onto the row (for forensics).
    await this.prisma.payment.update({
      where: { reference },
      data: { rawResponse: { init: result } as Prisma.InputJsonValue },
    });

    // Mark this as the chosen payment method on the booking.
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentMethod: PaymentMethod.PAYSTACK },
    });

    return {
      authorizationUrl: result.authorization_url,
      accessCode: result.access_code,
      reference,
    };
  }

  /**
   * Verify a payment by reference. Authoritative — used both by the
   * /pay/callback page (front-end calls after Paystack redirect) and by the
   * webhook handler. Idempotent: re-verifying an already-PAID payment is a no-op.
   */
  async verifyPaystack(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    // Already settled — return the current state without re-hitting Paystack.
    if (payment.status === PaymentStatus.PAID) {
      return {
        status: 'success' as const,
        bookingId: payment.bookingId,
        paymentStatus: payment.status,
      };
    }

    const result = await this.paystack.verifyTransaction(reference);
    const expectedKobo = Math.round(Number(payment.amount) * 100);
    const amountMatches = result.amount === expectedKobo;
    const currencyMatches =
      result.currency.toUpperCase() === payment.currency.toUpperCase();

    if (result.status === 'success' && amountMatches && currencyMatches) {
      await this.markPaid(reference, result.raw, result.paid_at);
      return {
        status: 'success' as const,
        bookingId: payment.bookingId,
        paymentStatus: PaymentStatus.PAID,
      };
    }

    if (result.status === 'failed' || result.status === 'abandoned') {
      await this.markFailed(reference, result.raw);
      return {
        status: 'failed' as const,
        bookingId: payment.bookingId,
        paymentStatus: PaymentStatus.FAILED,
        reason: result.status,
      };
    }

    // Pending / unknown status — leave row PENDING and report current state.
    return {
      status: 'pending' as const,
      bookingId: payment.bookingId,
      paymentStatus: PaymentStatus.PENDING,
      reason: result.status,
    };
  }

  // ─── Flutterwave ───────────────────────────────────────────────────────────

  /**
   * Initialize a Flutterwave Standard checkout for a booking. Mirrors
   * initializePaystack: creates a PENDING Payment row keyed by our tx_ref
   * (so the webhook has something to find), then redirects the user to the
   * hosted-checkout `link`.
   */
  async initializeFlutterwave(travelerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        traveler: { select: { id: true, email: true, name: true } },
        transport: { select: { currency: true, departureCity: true, destinationCity: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is cancelled');
    }
    // Same gating rule as Paystack init — payment unlocks only after the
    // transporter accepts the booking.
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Payment will unlock once the transporter confirms your booking.',
      );
    }

    const txRef = `smatway_${booking.id.replace(/-/g, '').slice(0, 20)}_${crypto
      .randomBytes(6)
      .toString('hex')}`;

    const amount = Number(booking.totalPrice);
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: PaymentMethod.FLUTTERWAVE,
        reference: txRef,
        amount,
        currency: booking.transport.currency,
        status: PaymentStatus.PENDING,
      },
    });

    const redirectUrl =
      process.env.FLW_REDIRECT_URL ?? 'http://localhost:3000/dashboard/pay/callback';

    const result = await this.flutterwave.initializeTransaction({
      email: booking.traveler.email,
      name: booking.traveler.name,
      amount,
      currency: booking.transport.currency,
      txRef,
      redirectUrl,
      // Steer the hosted checkout toward the rail that's familiar in the
      // booking's currency (M-Pesa for KES, MoMo for GHS/UGX/etc., card +
      // bank transfer + USSD for NGN). Falls through to Flutterwave's full
      // method list when the currency isn't mapped.
      paymentOptions: flutterwavePaymentOptionsFor(booking.transport.currency),
      metadata: {
        bookingId: booking.id,
        travelerId,
        provider: 'flutterwave',
        route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
      },
    });

    await this.prisma.payment.update({
      where: { reference: txRef },
      data: { rawResponse: { init: result } as Prisma.InputJsonValue },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentMethod: PaymentMethod.FLUTTERWAVE },
    });

    return {
      authorizationUrl: result.link,
      reference: txRef,
    };
  }

  /**
   * Verify a Flutterwave payment. Frontend can hand us either the tx_ref
   * (our reference) or Flutterwave's transaction_id. We prefer
   * transaction_id when present (callback URL carries both) since the
   * verify-by-id endpoint is the documented happy path.
   */
  async verifyFlutterwave(input: { reference?: string; transactionId?: string }) {
    if (!input.reference && !input.transactionId) {
      throw new BadRequestException('Provide reference or transactionId');
    }

    let txRef = input.reference ?? null;
    let payment = txRef
      ? await this.prisma.payment.findUnique({
          where: { reference: txRef },
          include: { booking: true },
        })
      : null;

    if (payment?.status === PaymentStatus.PAID) {
      return {
        status: 'success' as const,
        bookingId: payment.bookingId,
        paymentStatus: payment.status,
      };
    }

    const verified = input.transactionId
      ? await this.flutterwave.verifyTransactionById(input.transactionId)
      : await this.flutterwave.verifyTransactionByRef(input.reference!);

    // Backfill txRef from Flutterwave's response if we didn't have it.
    if (!txRef) txRef = verified.txRef;
    if (!payment) {
      payment = await this.prisma.payment.findUnique({
        where: { reference: txRef },
        include: { booking: true },
      });
    }
    if (!payment) throw new NotFoundException('Payment not found');

    const amountMatches = Math.abs(verified.amount - Number(payment.amount)) < 0.01;
    const currencyMatches =
      verified.currency.toUpperCase() === payment.currency.toUpperCase();

    if (verified.status === 'successful' && amountMatches && currencyMatches) {
      await this.markPaid(txRef, verified.raw, verified.paidAt);
      return {
        status: 'success' as const,
        bookingId: payment.bookingId,
        paymentStatus: PaymentStatus.PAID,
      };
    }

    if (verified.status === 'failed' || verified.status === 'cancelled') {
      await this.markFailed(txRef, verified.raw);
      return {
        status: 'failed' as const,
        bookingId: payment.bookingId,
        paymentStatus: PaymentStatus.FAILED,
        reason: verified.status,
      };
    }

    return {
      status: 'pending' as const,
      bookingId: payment.bookingId,
      paymentStatus: PaymentStatus.PENDING,
      reason: verified.status,
    };
  }

  /**
   * Flutterwave webhook. Verify the verif-hash header against
   * FLW_SECRET_HASH env (Flutterwave doesn't HMAC-sign — it just compares
   * a pre-shared secret). On charge.completed we re-verify by tx_ref.
   */
  async handleFlutterwaveWebhook(
    payload: { event?: string; data?: { tx_ref?: string; status?: string } },
    headerHash: string | undefined,
  ) {
    if (!this.flutterwave.verifyWebhookSignature(headerHash)) {
      throw new ForbiddenException('Invalid Flutterwave signature');
    }
    const txRef = payload.data?.tx_ref;
    if (!txRef) return { ok: true, ignored: 'no-tx_ref' };

    if (payload.event === 'charge.completed') {
      try {
        await this.verifyFlutterwave({ reference: txRef });
      } catch (err) {
        this.logger.error(
          `Flutterwave webhook verify failed for ${txRef}`,
          err as Error,
        );
      }
      return { ok: true };
    }
    return { ok: true, ignored: payload.event };
  }

  /**
   * Webhook entrypoint. Paystack signs with HMAC-SHA512(secret, rawBody) and
   * sends the result as `x-paystack-signature`. We verify before doing anything
   * with the body (defence against spoofed callbacks).
   *
   * On a `charge.success` event we trust the verification step (not the
   * payload) — fetch /transaction/verify ourselves to be sure. Any other
   * event types are logged + ignored for now.
   */
  async handlePaystackWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.paystack.verifyWebhookSignature(rawBody, signature)) {
      throw new ForbiddenException('Invalid Paystack signature');
    }
    const event = JSON.parse(rawBody.toString('utf8')) as {
      event: string;
      data: { reference?: string };
    };
    const reference = event.data?.reference;
    if (!reference) return { ok: true, ignored: 'no-reference' };

    if (event.event === 'charge.success') {
      // Re-verify with Paystack (don't trust webhook payload alone).
      try {
        await this.verifyPaystack(reference);
      } catch (err) {
        this.logger.error(`Paystack webhook verify failed for ${reference}`, err as Error);
      }
      return { ok: true };
    }
    if (event.event === 'charge.failed') {
      const payment = await this.prisma.payment.findUnique({ where: { reference } });
      if (payment) await this.markFailed(reference, event.data);
      return { ok: true };
    }
    return { ok: true, ignored: event.event };
  }

  private async markPaid(reference: string, raw: unknown, paidAt: string | null) {
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment) return;
    if (payment.status === PaymentStatus.PAID) return;
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { reference },
        data: {
          status: PaymentStatus.PAID,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          rawResponse: {
            ...((payment.rawResponse as object) ?? {}),
            verify: raw as Prisma.InputJsonValue,
          } as Prisma.InputJsonValue,
        },
      }),
      // Only flip paymentStatus. The booking's lifecycle status is already
      // CONFIRMED at this point (payment init is gated on it) — writing
      // status: CONFIRMED here would silently downgrade an IN_PROGRESS or
      // COMPLETED booking if a Paystack/Flutterwave webhook arrives late
      // or is re-fired after pickup verification.
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      }),
    ]);

    // Push a real-time notification to the transporter so they see the
    // booking is paid + chat is unlocked without having to refresh.
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: payment.bookingId },
        include: {
          traveler: { select: { id: true, name: true } },
          transport: {
            select: {
              transporterId: true,
              departureCity: true,
              destinationCity: true,
            },
          },
        },
      });
      if (booking) {
        this.chatGateway.notifyUser(booking.transport.transporterId, {
          type: 'booking_paid',
          bookingId: booking.id,
          traveler: booking.traveler,
          amount: Number(payment.amount),
          currency: payment.currency,
          route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
        });
      }
    } catch (err) {
      // Notification is best-effort; don't fail the payment over it.
      this.logger.warn(`Could not push payment notification: ${(err as Error).message}`);
    }
  }

  private async markFailed(reference: string, raw: unknown) {
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment) return;
    if (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.FAILED) return;
    await this.prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        rawResponse: {
          ...((payment.rawResponse as object) ?? {}),
          fail: raw as Prisma.InputJsonValue,
        } as Prisma.InputJsonValue,
      },
    });
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: PaymentStatus.FAILED },
    });
  }
}
