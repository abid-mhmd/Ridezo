import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import {
  VEHICLE_DOCUMENT_REPOSITORY,
  type IVehicleDocumentRepository,
} from '../../../vehicles/domain/repositories/vehicle-document.repository';
import type { VehicleDocumentEntity } from '../../../vehicles/domain/entities/vehicle-document.entity';
import type { ReviewVehicleDocumentDto } from '../dto/review-vehicle-document.dto';
import type { IReviewAdminVehicleDocumentUseCase } from '../interfaces/review-admin-vehicle-document.use-case.interface';

@Injectable()
export class ReviewAdminVehicleDocumentUseCase implements IReviewAdminVehicleDocumentUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_DOCUMENT_REPOSITORY)
    private readonly vehicleDocumentRepository: IVehicleDocumentRepository,
  ) {}

  async execute(
    vehicleId: string,
    documentId: string,
    dto: ReviewVehicleDocumentDto,
  ): Promise<VehicleDocumentEntity> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    const document = await this.vehicleDocumentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Vehicle document not found.');
    }

    if (document.vehicleId !== vehicleId) {
      throw new BadRequestException(
        'Document does not belong to the specified vehicle.',
      );
    }

    const isRejected = String(dto.status).toLowerCase() === 'rejected';
    const trimmedReason = dto.rejectionReason?.trim() || null;

    if (isRejected && !trimmedReason) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting a document.',
      );
    }

    const updated =
      await this.vehicleDocumentRepository.updateVerificationResult(
        documentId,
        dto.status,
        isRejected ? trimmedReason : null,
      );

    if (!updated) {
      throw new NotFoundException('Vehicle document not found.');
    }

    return updated;
  }
}
