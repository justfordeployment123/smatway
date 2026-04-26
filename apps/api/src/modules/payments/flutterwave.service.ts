import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

/**
 * Flutterwave V3 HTTP wrapper. Parallel to PaystackService.
 *
 * Differences worth knowing:
 *   - Webhook verification uses a plain "verif-hash" header that must equal
 *     the FLW_SECRET_HASH env value. NOT HMAC-signed.
 *   - Charges return a hosted-checkout `link` (not `authorization_url`).
 *   - Transfers don't need a "transfer recipient" — pass bank + account
 *     directly on every transfer call. We still gate transporter payouts on
 *     the bank account being resolved (verified against the bank) before
 *     storing it on the User row.
 *   - On the callback redirect, Flutterwave appends ?status=...&tx_ref=...&transaction_id=...
 *     We use tx_ref as our reference (we set it on initialize) and Flutterwave's
 *     transaction_id when calling /transactions/:id/verify.
 *
 * Required env:
 *   FLW_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxx-X
 *   FLW_SECRET_HASH=<random string set in dashboard "Webhooks" page>
 *   FLW_REDIRECT_URL=http://localhost:3000/dashboard/pay/callback
 */
@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  private secretKey(): string {
    const key = process.env.FLW_SECRET_KEY;
    if (!key) {
      throw new ServiceUnavailableException(
        'Flutterwave is not configured (FLW_SECRET_KEY missing).',
      );
    }
    return key;
  }

  /**
   * Initialize a Standard checkout. Returns the hosted-checkout `link`. Amount
   * stays in major units — Flutterwave accepts a decimal/string here, NOT
   * smallest currency unit (different from Paystack).
   */
  async initializeTransaction(input: {
    email: string;
    name: string | null;
    amount: number;
    currency: string;
    txRef: string;
    redirectUrl: string;
    metadata?: Record<string, unknown>;
    // Comma-separated Flutterwave payment-option keys (e.g. "mpesa,card").
    // When provided, the hosted checkout only surfaces these rails — useful
    // for steering KES bookings to M-Pesa instead of card by default. When
    // omitted, Flutterwave shows every method enabled on the account.
    paymentOptions?: string;
  }): Promise<{ link: string; txRef: string }> {
    const body: Record<string, unknown> = {
      tx_ref: input.txRef,
      amount: input.amount.toFixed(2),
      currency: input.currency.toUpperCase(),
      redirect_url: input.redirectUrl,
      customer: {
        email: input.email,
        name: input.name ?? input.email,
      },
      customizations: { title: 'SmatWay', description: 'Trip booking' },
      meta: input.metadata,
    };
    if (input.paymentOptions) {
      body.payment_options = input.paymentOptions;
    }

    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: { link: string };
    };
    if (!res.ok || json.status !== 'success' || !json.data?.link) {
      this.logger.error(`Flutterwave init failed: ${json.message ?? res.statusText}`);
      throw new BadRequestException(
        json.message ?? 'Could not initialize Flutterwave transaction',
      );
    }
    return { link: json.data.link, txRef: input.txRef };
  }

  /**
   * Verify by Flutterwave's transaction_id (NOT our tx_ref). The redirect URL
   * carries `?transaction_id=<id>&tx_ref=<ours>&status=<...>`. We pass the
   * transaction_id to this endpoint.
   */
  async verifyTransactionById(transactionId: string | number): Promise<{
    status: 'successful' | 'failed' | 'cancelled' | string;
    amount: number;
    currency: string;
    txRef: string;
    paidAt: string | null;
    raw: unknown;
  }> {
    const res = await fetch(
      `${this.baseUrl}/transactions/${encodeURIComponent(String(transactionId))}/verify`,
      { headers: { Authorization: `Bearer ${this.secretKey()}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: {
        status: string;
        amount: number;
        currency: string;
        tx_ref: string;
        created_at: string | null;
      };
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException(
        json.message ?? 'Could not verify Flutterwave transaction',
      );
    }
    return {
      status: json.data.status,
      amount: json.data.amount,
      currency: json.data.currency,
      txRef: json.data.tx_ref,
      paidAt: json.data.created_at,
      raw: json.data,
    };
  }

  /**
   * Verify by tx_ref (our reference). Used by the webhook flow when the
   * payload only carries our tx_ref, not Flutterwave's transaction_id.
   */
  async verifyTransactionByRef(txRef: string) {
    const res = await fetch(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
      { headers: { Authorization: `Bearer ${this.secretKey()}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: {
        id: number;
        status: string;
        amount: number;
        currency: string;
        tx_ref: string;
        created_at: string | null;
      };
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException(
        json.message ?? 'Could not verify Flutterwave transaction',
      );
    }
    return {
      transactionId: json.data.id,
      status: json.data.status,
      amount: json.data.amount,
      currency: json.data.currency,
      txRef: json.data.tx_ref,
      paidAt: json.data.created_at,
      raw: json.data,
    };
  }

  /**
   * Bank list. Country code is ISO-2 (NG, GH, KE, UG, TZ, ZA, ZM).
   */
  async listBanks(country: string = 'NG'): Promise<Array<{ name: string; code: string }>> {
    const res = await fetch(`${this.baseUrl}/banks/${encodeURIComponent(country.toUpperCase())}`, {
      headers: { Authorization: `Bearer ${this.secretKey()}` },
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: Array<{ id: number; code: string; name: string }>;
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not load Flutterwave bank list');
    }
    return json.data.map((b) => ({ name: b.name, code: b.code }));
  }

  /**
   * Resolve account number → legal account name. Body, not query params.
   */
  async resolveAccount(accountNumber: string, bankCode: string): Promise<{
    accountName: string;
    accountNumber: string;
  }> {
    const res = await fetch(`${this.baseUrl}/accounts/resolve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: { account_number: string; account_name: string };
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not verify account');
    }
    return {
      accountName: json.data.account_name,
      accountNumber: json.data.account_number,
    };
  }

  /**
   * Initiate a transfer to a bank account. Flutterwave doesn't have a
   * "recipient" concept — pass bank+account every time. Reference is our
   * idempotency key.
   */
  async initiateTransfer(input: {
    amount: number;
    currency: string;
    bankCode: string;
    accountNumber: string;
    reference: string;
    narration?: string;
  }): Promise<{
    status: string;
    transferId: number | null;
    raw: unknown;
  }> {
    const res = await fetch(`${this.baseUrl}/transfers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank: input.bankCode,
        account_number: input.accountNumber,
        amount: input.amount,
        currency: input.currency.toUpperCase(),
        narration: input.narration ?? 'SmatWay payout',
        reference: input.reference,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: { id: number; status: string; reference: string };
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException(json.message ?? 'Could not initiate Flutterwave transfer');
    }
    return {
      status: json.data.status,
      transferId: json.data.id,
      raw: json.data,
    };
  }

  /**
   * Re-fetch a transfer to reconcile its final state.
   */
  async fetchTransfer(transferId: number): Promise<{ status: string; raw: unknown }> {
    const res = await fetch(`${this.baseUrl}/transfers/${transferId}`, {
      headers: { Authorization: `Bearer ${this.secretKey()}` },
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      data?: { status: string };
    };
    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new BadRequestException('Could not fetch Flutterwave transfer');
    }
    return { status: json.data.status, raw: json.data };
  }

  /**
   * Verify the verif-hash header matches FLW_SECRET_HASH env. Flutterwave
   * doesn't use HMAC — it just compares the header against a pre-shared
   * secret you set in the dashboard. Keep FLW_SECRET_HASH out of source
   * control.
   */
  verifyWebhookSignature(headerHash: string | undefined): boolean {
    const expected = process.env.FLW_SECRET_HASH;
    if (!expected || !headerHash) return false;
    // Constant-time compare to avoid timing attacks.
    if (headerHash.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i += 1) {
      mismatch |= expected.charCodeAt(i) ^ headerHash.charCodeAt(i);
    }
    return mismatch === 0;
  }
}
