import type { VehicleDocumentEntity } from '../../../vehicles/domain/entities/vehicle-document.entity';
import type { ReviewVehicleDocumentDto } from '../dto/review-vehicle-document.dto';

export const REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE = Symbol(
  'REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE',
);

export interface IReviewAdminVehicleDocumentUseCase {
  execute(
    vehicleId: string,
    documentId: string,
    dto: ReviewVehicleDocumentDto,
  ): Promise<VehicleDocumentEntity>;
}
