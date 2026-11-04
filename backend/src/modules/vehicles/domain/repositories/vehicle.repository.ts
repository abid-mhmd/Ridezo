import type { VehicleEntity } from '../entities/vehicle.entity.js';

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export type CreateVehicleData = Omit<
  VehicleEntity,
  'id' | 'createdAt' | 'updatedAt' | 'verificationStatus' | 'isActive'
>;

export type UpdateVehicleData = Partial<
  Pick<
    VehicleEntity,
    | 'vehicleType'
    | 'brand'
    | 'model'
    | 'year'
    | 'color'
    | 'registrationNumber'
    | 'seatCapacity'
    | 'fuelType'
    | 'vehiclePhoto'
  >
>;

export interface IVehicleRepository {
  create(data: CreateVehicleData): Promise<VehicleEntity>;

  findByIdAndOwner(
    vehicleId: string,
    ownerId: string,
  ): Promise<VehicleEntity | null>;
  findByOwnerId(ownerId: string): Promise<VehicleEntity[]>;

  update(
    vehicleId: string,
    ownerId: string,
    data: UpdateVehicleData,
  ): Promise<VehicleEntity | null>;

  deactivate(vehicleId: string, ownerId: string): Promise<boolean>;
  existsByRegistrationNumber(registrationNumber: string): Promise<boolean>;
}
