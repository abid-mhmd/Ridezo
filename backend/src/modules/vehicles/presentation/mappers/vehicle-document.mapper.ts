import type { VehicleDocumentEntity } from '../../domain/entities/vehicle-document.entity';
import type { VehicleDocumentResponseDto } from '../dto/vehicle-document-response.dto';

export class VehicleDocumentMapper {
  static toResponse(
    document: VehicleDocumentEntity,
  ): VehicleDocumentResponseDto {
    return {
      id: document.id,
      vehicleId: document.vehicleId,
      documentType: document.documentType,
      verificationStatus: document.verificationStatus,
      expiryDate: document.expiryDate,
      createdAt: document.createdAt,
    };
  }

  static toResponseList(
    documents: VehicleDocumentEntity[],
  ): VehicleDocumentResponseDto[] {
    return documents.map((document) => this.toResponse(document));
  }
}
