import { Inject, Injectable } from '@nestjs/common';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository.js';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.js';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity.js';

@Injectable()
export class GetMyVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(ownerId: string): Promise<VehicleEntity[]> {
    return this.vehicleRepository.findByOwnerId(ownerId);
  }
}
