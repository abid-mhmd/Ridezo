export type VehicleType = 'hatchback' | 'sedan' | 'suv' | 'muv' | 'van';

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';

export type VehicleVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Vehicle {
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
  createdAt: string;
  updatedAt: string;
}

export interface AddVehiclePayload {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: FuelType;
  vehiclePhoto?: string;
}

export type UpdateVehiclePayload = Partial<AddVehiclePayload>;
