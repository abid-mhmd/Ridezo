import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import {
  VEHICLE_DOCUMENT_REPOSITORY,
  type IVehicleDocumentRepository,
} from '../../../vehicles/domain/repositories/vehicle-document.repository';
import { VehicleVerificationStatus } from '../../../vehicles/domain/enums/vehicle.enums';
import { DocumentVerificationStatus } from '../../../vehicles/domain/enums/vehicle-document.enums';
import type {
  IUpdateAdminVehicleStatusUseCase,
  UpdateAdminVehicleStatusResult,
} from '../interfaces/update.admin-vehicle.status.use-case.interface';

@Injectable()
export class UpdateAdminVehicleStatusUseCase implements IUpdateAdminVehicleStatusUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,
  ) {}

  async execute(
    vehicleId: string,
    status: VehicleVerificationStatus,
  ): Promise<UpdateAdminVehicleStatusResult> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    if (status === VehicleVerificationStatus.APPROVED) {
      const documents =
        await this.vehicleDocumentRepository.findByVehicleId(vehicleId);

      await Promise.all(
        documents.map((doc) =>
          this.vehicleDocumentRepository.updateVerificationResult(
            doc.id,
            DocumentVerificationStatus.APPROVED,
            null,
          ),
        ),
      );
    }

    await this.vehicleRepository.updateVerificationStatus(vehicleId, status);

    return {
      id: vehicle.id,
      verificationStatus: status,
    };
  }
}
