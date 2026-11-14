import type { UploadVehicleDocumentDto } from '../dto/upload-vehicle-document.dto';
import type { VehicleDocumentType } from '../../domain/enums/vehicle-document.enums';
import type { DocumentVerificationStatus } from '../../domain/enums/vehicle-document.enums';

export const UPLOAD_VEHICLE_DOCUMENT_USE_CASE = Symbol(
  'UPLOAD_VEHICLE_DOCUMENT_USE_CASE',
);

export interface UploadVehicleDocumentResult {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: Date | null;
  createdAt: Date;
}

export interface IUploadVehicleDocumentUseCase {
  execute(
    userId: string,
    vehicleId: string,
    dto: UploadVehicleDocumentDto,
    file: Express.Multer.File,
  ): Promise<UploadVehicleDocumentResult>;
}
