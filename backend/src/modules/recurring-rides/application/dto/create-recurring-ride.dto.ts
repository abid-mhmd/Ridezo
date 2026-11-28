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
import { RECURRING_RIDE_CONSTANTS } from '../../domain/constants/recurring-ride.constants';

export class CreateRecurringRideDto {
  @IsString()
  vehicleId: string;

  @IsObject()
  origin: RideLocation;

  @IsObject()
  destination: RideLocation;

  @IsOptional()
  @IsArray()
  stops?: RideLocation[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'departureTime must be in 24-hour HH:mm format.',
  })
  departureTime: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSeats: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @IsOptional()
  @IsObject()
  preferences?: RidePreferences;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(RECURRING_RIDE_CONSTANTS.MIN_GENERATE_AHEAD_DAYS)
  @Max(RECURRING_RIDE_CONSTANTS.MAX_GENERATE_AHEAD_DAYS)
  generateAheadDays?: number;
}
