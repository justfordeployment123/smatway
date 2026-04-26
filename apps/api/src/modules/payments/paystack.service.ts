import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Paystack HTTP wrapper. Talks to api.paystack.co using native fetch (Node 24+).
 * Webhook signature verification per the docs: HMAC-SHA512 of the raw body
 * using the secret key, hex-encoded, compared against `x-paystack-signature`.
 *
 * Init returns an authorization_url the frontend redirects to. Verify is the
 * primary check on payment status; webhook is just the push that triggers it.
 */
@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';

  private secretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
      throw new ServiceUnavailableException(
        'Paystack is not configured (PAYSTACK_SECRET_KEY missing).',
      );
    }
    return key;
  }

  /**
   * Initialize a transaction. Paystack expects amount in the smallest currency
   * unit (kobo for NGN, pesewa for GHS) — multiply by 100.
   *
   * Reference is generated client-side here (rather than letting Paystack
   * generate it) so we can save the row before the API call and trust that
   * the webhook will find a row to update. UUID-based to avoid collisions.
   */
  async initializeTransaction(input: {
    email: string;
    amount: number; // major units (e.g. 18000 for ₦18,000)
    currency: string; // ISO 4217 — Paystack supports NGN, GHS, USD, KES, ZAR
    reference: string;
    callbackUrl: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    const body = {
      email: input.email,
      amount: Math.round(input.amount * 100), // smallest currency unit
      currency: input.currency.toUpperCase(),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    };

    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };
    if (!res.ok || !json.status || !json.data) {
      this.logger.error(`Paystack init failed: ${json.message ?? res.statusText}`);
      throw new BadRequestException(
        json.message ?? 'Could not initialize Paystack transaction',
      );
    }
    return json.data;
  }

  /**
   * Verify a transaction. Authoritative — never trust the client to report
   * payment success; always verify with Paystack before flipping
   * Booking.paymentStatus to PAID.
   */
  async verifyTransaction(reference: string): Promise<{
    status: 'success' | 'failed' | 'abandoned' | 'reversed' | string;
    amount: number; // smallest currency unit
    currency: string;
    paid_at: string | null;
    raw: unknown;
  }> {
    const res = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${this.secretKey()}` },
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: {
        status: string;
        amount: number;
        currency: string;
        paid_at: string | null;
      };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not verify Paystack transaction');
    }
    return {
      status: json.data.status,
      amount: json.data.amount,
      currency: json.data.currency,
      paid_at: json.data.paid_at,
      raw: json.data,
    };
  }

  /**
   * List supported banks for a given country/currency. Used by the transporter
   * payout-account form so users can pick from a dropdown instead of typing
   * a bank code from memory. Currency is "NGN" (default), "GHS", "ZAR", "KES".
   */
  async listBanks(currency: string = 'NGN'): Promise<Array<{ name: string; code: string; longcode: string }>> {
    const res = await fetch(
      `${this.baseUrl}/bank?currency=${encodeURIComponent(currency.toUpperCase())}&perPage=200`,
      { headers: { Authorization: `Bearer ${this.secretKey()}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: Array<{ name: string; code: string; longcode: string }>;
    };
    if (!res.ok || !json.status || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not load bank list');
    }
    return json.data;
  }

  /**
   * Verify a bank account number resolves to a real account name. Paystack
   * calls this "Resolve Account Number" — it queries the bank's API and
   * returns the legally-registered account holder. Use this before creating
   * a transfer recipient so we don't store typo'd account numbers.
   */
  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string; accountNumber: string }> {
    const res = await fetch(
      `${this.baseUrl}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      { headers: { Authorization: `Bearer ${this.secretKey()}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { account_name: string; account_number: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not verify account');
    }
    return { accountName: json.data.account_name, accountNumber: json.data.account_number };
  }

  /**
   * Create a transfer recipient — Paystack's stable identifier for "send money
   * to this bank account". Returned `recipient_code` (e.g. RCP_xxxx) is what
   * we save on the User and pass to /transfer when releasing payouts.
   *
   * `type` is "nuban" for Nigerian banks, "ghipss" for Ghanaian banks (GIP),
   * "mobile_money" for some markets. We default to nuban; the controller can
   * override based on currency.
   */
  async createTransferRecipient(input: {
    name: string;
    accountNumber: string;
    bankCode: string;
    currency: string;
    type?: 'nuban' | 'ghipss' | 'mobile_money';
  }): Promise<{ recipientCode: string; raw: unknown }> {
    const type = input.type ?? (input.currency.toUpperCase() === 'GHS' ? 'ghipss' : 'nuban');
    const res = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        name: input.name,
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: input.currency.toUpperCase(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { recipient_code: string };
    };
    if (!res.ok || !json.status || !json.data?.recipient_code) {
      throw new BadRequestException(json.message ?? 'Could not create transfer recipient');
    }
    return { recipientCode: json.data.recipient_code, raw: json.data };
  }

  /**
   * Initiate a transfer from the platform's Paystack balance to a recipient.
   * Amount is in major units (we multiply by 100 internally — same as
   * initializeTransaction). On a Paystack account where transfers OTP is
   * disabled (recommended for automated payouts) the transfer settles
   * immediately. Otherwise the API returns status="otp" and the merchant
   * must complete via /transfer/finalize_transfer with the OTP — that path
   * is out of scope here; document for the operator to disable Transfers OTP
   * in their Paystack dashboard before using auto-payout.
   */
  async initiateTransfer(input: {
    amount: number;          // major units
    recipientCode: string;   // RCP_…
    currency: string;        // ISO 4217
    reference: string;       // our idempotency key
    reason?: string;         // appears on bank statement
  }): Promise<{
    status: string;
    transferCode: string;
    raw: unknown;
  }> {
    const res = await fetch(`${this.baseUrl}/transfer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(input.amount * 100),
        currency: input.currency.toUpperCase(),
        recipient: input.recipientCode,
        reason: input.reason ?? 'SmatWay payout',
        reference: input.reference,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { status: string; transfer_code: string };
    };
    if (!res.ok || !json.status || !json.data?.transfer_code) {
      throw new BadRequestException(json.message ?? 'Could not initiate transfer');
    }
    return {
      status: json.data.status,
      transferCode: json.data.transfer_code,
      raw: json.data,
    };
  }

  /**
   * Verify a transfer by reference (the one we sent in initiateTransfer).
   * Used for reconciliation when the transfer.success webhook is missed.
   */
  async verifyTransfer(reference: string): Promise<{ status: string; raw: unknown }> {
    const res = await fetch(
      `${this.baseUrl}/transfer/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${this.secretKey()}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: { status: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not verify transfer');
    }
    return { status: json.data.status, raw: json.data };
  }

  /**
   * Verify the HMAC-SHA512 of the raw request body matches the signature
   * Paystack sends in the `x-paystack-signature` header. Use timingSafeEqual
   * to avoid timing attacks. The body MUST be the raw bytes (no JSON parse,
   * no whitespace mutation) — the express raw-body middleware in our payments
   * module captures it before NestJS parses.
   */
  verifyWebhookSignature(rawBody: Buffer | string, signature: string | undefined): boolean {
    if (!signature) return false;
    const computed = crypto
      .createHmac('sha512', this.secretKey())
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(computed, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }
}
