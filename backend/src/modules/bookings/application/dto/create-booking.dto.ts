import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  rideId: string;

  @IsInt()
  @Min(1)
  seatsRequested: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
