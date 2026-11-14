import type { VehicleDocumentEntity } from '../entities/vehicle-document.entity';
import type { VehicleDocumentType } from '../enums/vehicle-document.enums';
import type { DocumentVerificationStatus } from '../enums/vehicle-document.enums';

export const VEHICLE_DOCUMENT_REPOSITORY = Symbol(
  'VEHICLE_DOCUMENT_REPOSITORY',
);

export type CreateVehicleDocumentData = Pick<
  VehicleDocumentEntity,
  | 'vehicleId'
  | 'documentType'
  | 'documentKey'
  | 'originalFileName'
  | 'mimeType'
  | 'fileSize'
  | 'expiryDate'
>;

export interface IVehicleDocumentRepository {
  create(data: CreateVehicleDocumentData): Promise<VehicleDocumentEntity>;
  findByVehicleId(vehicleId: string): Promise<VehicleDocumentEntity[]>;
  findById(documentId: string): Promise<VehicleDocumentEntity | null>;
  findLatestByVehicleAndType(
    vehicleId: string,
    documentType: VehicleDocumentType,
  ): Promise<VehicleDocumentEntity | null>;
  updateVerificationResult(
    documentId: string,
    status: DocumentVerificationStatus,
    rejectionReason?: string | null,
    expiryDate?: Date | null,
  ): Promise<VehicleDocumentEntity | null>;
}
