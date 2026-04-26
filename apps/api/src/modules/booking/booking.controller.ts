import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentMethod, User } from '@prisma/client';
import { IsEnum, IsString, Matches } from 'class-validator';

class UpdatePaymentDto {
  @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod;
}

class VerifyPickupDto {
  // Accept 10-digit (post-bump) and the legacy 6-digit form so any in-flight
  // bookings created before the keyspace bump still validate. Service-side
  // verifyPickup() applies the same regex.
  @IsString() @Matches(/^\d{6}$|^\d{10}$/, { message: 'Pickup code must be 10 digits' })
  code!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(user.id, dto);
  }

  @Get('my')
  myBookings(@CurrentUser() user: User) {
    return this.bookingService.myBookings(user.id);
  }

  @Get('transporter/all')
  allTransporterBookings(@CurrentUser() user: User) {
    return this.bookingService.allTransporterBookings(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.findOne(id, user.id);
  }

  @Get('transport/:transportId')
  transportBookings(@Param('transportId') transportId: string, @CurrentUser() user: User) {
    return this.bookingService.transportBookings(transportId, user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.cancel(id, user.id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.confirm(id, user.id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.reject(id, user.id);
  }

  // Legacy PATCH :id/complete removed — see BookingService comment. Closure
  // goes through the requestCompletion → confirmArrival pair so a transporter
  // can't trigger their own payout.

  /**
   * Transporter-side pickup verification. Body carries the 10-digit code the
   * traveler shows (from QR or by reading aloud). No booking ID — we look
   * the booking up by code so transporter can't bypass the check.
   */
  @Post('verify-pickup')
  verifyPickup(@CurrentUser() user: User, @Body() dto: VerifyPickupDto) {
    return this.bookingService.verifyPickup(dto.code, user.id);
  }

  /**
   * Traveler-side "I've arrived" — closes out the trip. Allowed only after
   * pickup has been verified (status = IN_PROGRESS).
   */
  @Patch(':id/arrived')
  arrived(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.confirmArrival(id, user.id);
  }

  /**
   * Transporter-side "Ride completed" — pre-flag the trip as done so the
   * traveler is prompted to confirm. Doesn't actually mark COMPLETED on its
   * own (that requires the traveler's accept) — see comment in
   * BookingService.requestCompletion for why.
   */
  @Patch(':id/request-completion')
  requestCompletion(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.requestCompletion(id, user.id);
  }

  @Patch(':id/payment-method')
  updatePaymentMethod(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.bookingService.updatePaymentMethod(id, user.id, dto.paymentMethod);
  }
}
