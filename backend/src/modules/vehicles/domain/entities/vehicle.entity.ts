import {
  FuelType,
  VehicleType,
  VehicleVerificationStatus,
} from '../enums/vehicle.enums.js';

export interface VehicleEntity {
  id: string;
  ownerId: string;
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
