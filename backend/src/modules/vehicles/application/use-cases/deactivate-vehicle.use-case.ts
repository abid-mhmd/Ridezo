import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants';
import type { IDeactivateVehicleUseCase } from '../interfaces/deactivate-vehicle.use-case.interface';

@Injectable()
export class DeactivateVehicleUseCase implements IDeactivateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(vehicleId: string, ownerId: string): Promise<void> {
    const deactivated = await this.vehicleRepository.deactivate(
      vehicleId,
      ownerId,
    );

    if (!deactivated) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }
  }
}
