import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import type { VehicleVerificationStatus } from '../../../vehicles/domain/enums/vehicle.enums';
import type {
  IUpdateAdminVehicleStatusUseCase,
  UpdateAdminVehicleStatusResult,
} from '../interfaces/update.admin-vehicle.status.use-case.interface';

@Injectable()
export class UpdateAdminVehicleStatusUseCase implements IUpdateAdminVehicleStatusUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    vehicleId: string,
    status: VehicleVerificationStatus,
  ): Promise<UpdateAdminVehicleStatusResult> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    await this.vehicleRepository.updateVerificationStatus(vehicleId, status);

    return {
      id: vehicle.id,
      verificationStatus: status,
    };
  }
}
