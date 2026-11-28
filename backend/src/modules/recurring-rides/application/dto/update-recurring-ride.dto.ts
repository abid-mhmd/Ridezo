import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import type {
  RideLocation,
  RidePreferences,
} from '../../../rides/domain/entities/ride.entity';

export class UpdateRecurringRideDto {
  @IsOptional()
  @IsObject()
  origin?: RideLocation;

  @IsOptional()
  @IsObject()
  destination?: RideLocation;

  @IsOptional()
  @IsArray()
  stops?: RideLocation[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'departureTime must be in 24-hour HH:mm format.',
  })
  departureTime?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSeats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerSeat?: number;

  @IsOptional()
  @IsObject()
  preferences?: RidePreferences;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;
}
