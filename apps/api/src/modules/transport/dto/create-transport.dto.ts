import { IsNotEmpty, IsNumber, IsInt, IsString, Min } from 'class-validator';

export class CreateTransportDto {
  @IsString() @IsNotEmpty() departureCountry!: string;
  @IsString() @IsNotEmpty() departureCity!: string;
  @IsString() @IsNotEmpty() destinationCountry!: string;
  @IsString() @IsNotEmpty() destinationCity!: string;

  @IsString() @IsNotEmpty() vehicleId!: string;

  @IsNumber() @Min(0) price!: number;

  @IsInt() @Min(1) availableSeats!: number;

  @IsString() @IsNotEmpty() departureDateTime!: string;

  @IsString() @IsNotEmpty() maxReachDateTime!: string;
}
