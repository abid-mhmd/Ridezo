import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  SmokingPreference,
  PetPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
} from '../../../users/domain/enums/user.enums';

class RideCoordinatesDto {
  @IsString()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

class RideLocationDto {
  @IsString()
  placeId: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => RideCoordinatesDto)
  coordinates: RideCoordinatesDto;
}

class RidePreferencesDto {
  @IsOptional()
  @IsEnum(SmokingPreference)
  smoking?: SmokingPreference;

  @IsOptional()
  @IsEnum(PetPreference)
  pets?: PetPreference;

  @IsOptional()
  @IsEnum(SeatingComfortPreference)
  seatingComfort?: SeatingComfortPreference;

  @IsOptional()
  @IsEnum(ClimateControlPreference)
  climateControl?: ClimateControlPreference;
}

export class CreateRideDto {
  @IsMongoId()
  vehicleId: string;

  @ValidateNested()
  @Type(() => RideLocationDto)
  origin: RideLocationDto;

  @ValidateNested()
  @Type(() => RideLocationDto)
  destination: RideLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RideLocationDto)
  stops: RideLocationDto[];

  @IsDateString()
  departureTime: string;

  @IsNumber()
  @Min(1)
  totalSeats: number;

  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @ValidateNested()
  @Type(() => RidePreferencesDto)
  preferences: RidePreferencesDto;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;
}
