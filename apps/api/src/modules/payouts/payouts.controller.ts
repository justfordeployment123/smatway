import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentMethod, User } from '@prisma/client';
import { PayoutsService } from './payouts.service';

class SetPayoutAccountDto {
  bankCode!: string;
  accountNumber!: string;
  currency!: string;
  provider?: PaymentMethod; // PAYSTACK (default) | FLUTTERWAVE
}

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  /** Bank dropdown for the transporter's payout-account form. */
  @Get('banks')
  banks(
    @Query('currency') currency: string = 'NGN',
    @Query('provider') provider: PaymentMethod = PaymentMethod.PAYSTACK,
  ) {
    return this.payoutsService.listBanks(currency, provider);
  }

  /** Resolve account number → legal account name. Used for live preview as the user types. */
  @Get('resolve/:bankCode/:accountNumber')
  resolve(
    @Param('bankCode') bankCode: string,
    @Param('accountNumber') accountNumber: string,
    @Query('provider') provider: PaymentMethod = PaymentMethod.PAYSTACK,
  ) {
    return this.payoutsService.resolveAccount(accountNumber, bankCode, provider);
  }

  /** Transporter sets / updates their bank account. */
  @Put('account')
  setAccount(@CurrentUser() user: User, @Body() dto: SetPayoutAccountDto) {
    return this.payoutsService.setPayoutAccount(user.id, dto);
  }

  /** Transporter views current bank account on file. */
  @Get('account')
  getAccount(@CurrentUser() user: User) {
    return this.payoutsService.getPayoutAccount(user.id);
  }

  /**
   * Remove just one provider's payout account, leaving the other intact.
   * Use ?provider=PAYSTACK or ?provider=FLUTTERWAVE — the column set for
   * that provider is cleared. The opposite provider's data stays untouched
   * so a transporter can keep one rail while disconnecting the other.
   */
  @Delete('account')
  removeAccount(
    @CurrentUser() user: User,
    @Query('provider') provider?: PaymentMethod,
  ) {
    if (provider !== PaymentMethod.PAYSTACK && provider !== PaymentMethod.FLUTTERWAVE) {
      throw new BadRequestException('provider must be PAYSTACK or FLUTTERWAVE');
    }
    return this.payoutsService.removePayoutAccount(user.id, provider);
  }

  /** Transporter lists their own payouts. */
  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.payoutsService.listMine(user.id);
  }
}
