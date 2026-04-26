import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransportType } from '@prisma/client';

export class SearchTransportDto {
  @IsOptional() @IsString() departureCity?: string;
  @IsOptional() @IsString() departureCountry?: string;
  @IsOptional() @IsString() destinationCity?: string;
  @IsOptional() @IsString() destinationCountry?: string;
  @IsOptional() @IsEnum(TransportType) transportType?: TransportType;

  /**
   * Naked YYYY-MM-DD — kept for backward compat. Treated as a UTC day
   * boundary, which mis-matches routes that fall on a different UTC day vs
   * local day. Prefer `from`/`to` from the client.
   */
  @IsOptional() @IsString() date?: string;

  /**
   * ISO timestamps representing the *user's local-day boundary* converted
   * to UTC by the client. Example: a Karachi user picking Apr 26 sends
   * `from=2026-04-25T19:00:00.000Z&to=2026-04-26T19:00:00.000Z` (i.e. the
   * UTC instants for "Apr 26 00:00 PKT" and "Apr 27 00:00 PKT").
   */
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}
