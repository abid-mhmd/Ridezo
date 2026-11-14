import {
  IsArray,
  IsDateString,
  IsEnum,
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

class UpdateRideCoordinatesDto {
  @IsString()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

class UpdateRideLocationDto {
  @IsString()
  placeId: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => UpdateRideCoordinatesDto)
  coordinates: UpdateRideCoordinatesDto;
}

class UpdateRidePreferencesDto {
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

export class UpdateRideDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRideLocationDto)
  origin?: UpdateRideLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRideLocationDto)
  destination?: UpdateRideLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRideLocationDto)
  stops?: UpdateRideLocationDto[];

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerSeat?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRidePreferencesDto)
  preferences?: UpdateRidePreferencesDto;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;
}
