import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initialize a Paystack payment for a booking. Returns the hosted-checkout
   * URL the frontend should redirect the user to.
   */
  @Post('initialize/paystack/:bookingId')
  @UseGuards(JwtAuthGuard)
  initialize(@CurrentUser() user: User, @Param('bookingId') bookingId: string) {
    return this.paymentsService.initializePaystack(user.id, bookingId);
  }

  /**
   * Verify a payment by reference. Frontend hits this from the /pay/callback
   * page after Paystack redirects the user back. Idempotent — safe to call
   * multiple times.
   */
  @Get('verify/paystack/:reference')
  @UseGuards(JwtAuthGuard)
  verify(@Param('reference') reference: string) {
    return this.paymentsService.verifyPaystack(reference);
  }

  /**
   * Paystack webhook. NO auth guard — Paystack signs the body and we verify
   * the signature inside the service. The raw body is required for HMAC, so
   * make sure express raw-body capture is enabled in main.ts (we do, see the
   * `rawBody: true` flag in NestFactory.create).
   */
  @Post('webhook/paystack')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature?: string,
    @Body() _body?: unknown,
  ) {
    // req.rawBody is available because main.ts enables rawBody: true.
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(_body ?? {}));
    return this.paymentsService.handlePaystackWebhook(raw, signature);
  }

  // ─── Flutterwave ───────────────────────────────────────────────────────────

  /**
   * Initialize a Flutterwave Standard checkout for a booking. Returns the
   * hosted-checkout URL the frontend redirects to.
   */
  @Post('initialize/flutterwave/:bookingId')
  @UseGuards(JwtAuthGuard)
  initializeFlutterwave(
    @CurrentUser() user: User,
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.initializeFlutterwave(user.id, bookingId);
  }

  /**
   * Verify a Flutterwave payment. Frontend calls this from /pay/callback
   * after Flutterwave redirects with ?status=...&tx_ref=...&transaction_id=...
   * Either reference (our tx_ref) or transactionId (Flutterwave's id) is
   * accepted; transactionId is preferred when present.
   */
  @Get('verify/flutterwave')
  @UseGuards(JwtAuthGuard)
  verifyFlutterwave(
    @Query('reference') reference?: string,
    @Query('transactionId') transactionId?: string,
  ) {
    return this.paymentsService.verifyFlutterwave({ reference, transactionId });
  }

  /**
   * Flutterwave webhook. NO auth guard — verif-hash header is checked
   * against FLW_SECRET_HASH env inside the service.
   */
  @Post('webhook/flutterwave')
  @HttpCode(200)
  async flutterwaveWebhook(
    @Body() body: { event?: string; data?: { tx_ref?: string; status?: string } },
    @Headers('verif-hash') verifHash?: string,
  ) {
    return this.paymentsService.handleFlutterwaveWebhook(body, verifHash);
  }
}
