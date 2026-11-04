import {
  FuelType,
  VehicleType,
  VehicleVerificationStatus,
} from '../../domain/enums/vehicle.enums.js';

export interface VehicleResponseDto {
  id: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: FuelType;
  vehiclePhoto: string;
  verificationStatus: VehicleVerificationStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
