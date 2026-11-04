import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FuelType, VehicleType } from '../../domain/enums/vehicle.enums.js';

export class AddVehicleDto {
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  brand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  color: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  registrationNumber: string;

  @IsInt()
  @Min(1)
  @Max(8)
  seatCapacity: number;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsOptional()
  @IsUrl()
  vehiclePhoto?: string;
}
