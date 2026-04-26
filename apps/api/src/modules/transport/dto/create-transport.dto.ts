import { IsBoolean, IsNotEmpty, IsNumber, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateTransportDto {
  @IsString() @IsNotEmpty() departureCountry!: string;
  @IsString() @IsNotEmpty() departureCity!: string;
  @IsString() @IsNotEmpty() destinationCountry!: string;
  @IsString() @IsNotEmpty() destinationCity!: string;

  @IsString() @IsNotEmpty() vehicleId!: string;

  @IsNumber() @Min(0) price!: number;

  // ISO 4217 currency code (e.g. "NGN", "GHS"). Optional — falls back to transporter's preferredCurrency or USD.
  @IsOptional() @IsString() @Length(3, 3) currency?: string;

  @IsInt() @Min(1) availableSeats!: number;

  @IsString() @IsNotEmpty() departureDateTime!: string;

  @IsString() @IsNotEmpty() maxReachDateTime!: string;

  // Group-ride threshold. When set, the trip is "filling" until this many
  // seats are booked across non-cancelled bookings. Below threshold:
  // payment is locked for travelers and the transporter's per-booking
  // Confirm button is gated (overridable). At/above threshold: pay opens
  // (after the booking is CONFIRMED — either auto, see flag below, or
  // by the transporter clicking Confirm).
  @IsOptional() @IsInt() @Min(1) minSeatsToConfirm?: number;

  // When true, every PENDING booking on the route auto-flips to
  // CONFIRMED the moment the threshold is met. When false (default),
  // transporter still confirms each one manually.
  @IsOptional() @IsBoolean() autoConfirmOnFill?: boolean;
}
