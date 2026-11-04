import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository.js';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.js';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity.js';

@Injectable()
export class GetVehicleByIdUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(vehicleId: string, ownerId: string): Promise<VehicleEntity> {
    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      ownerId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    return vehicle;
  }
}
