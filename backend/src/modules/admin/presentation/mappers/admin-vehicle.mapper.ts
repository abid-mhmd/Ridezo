import type { AdminVehicleListItem } from '../../application/interfaces/list-admin-vehicles.use-case.interface';
import type { AdminVehicleDetailsResult } from '../../application/interfaces/get-admin-vehicle-details.use-case.interface';
import type {
  AdminVehicleDetailsDto,
  AdminVehicleListItemDto,
} from '../dto/admin-vehicle-response.dto';

export class AdminVehicleMapper {
  static toListItem(item: AdminVehicleListItem): AdminVehicleListItemDto {
    const { vehicle, owner, documentsSummary } = item;

    return {
      id: vehicle.id,
      owner,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      seatCapacity: vehicle.seatCapacity,
      fuelType: vehicle.fuelType,
      vehiclePhoto: vehicle.vehiclePhoto,
      verificationStatus: vehicle.verificationStatus,
      isActive: vehicle.isActive,
      documentsSummary,
      createdAt: vehicle.createdAt,
    };
  }

  static toListResponse(
    items: AdminVehicleListItem[],
  ): AdminVehicleListItemDto[] {
    return items.map((item) => this.toListItem(item));
  }

  static toDetailsResponse(
    result: AdminVehicleDetailsResult,
  ): AdminVehicleDetailsDto {
    const { vehicle, owner, documents } = result;

    return {
      id: vehicle.id,
      owner,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      seatCapacity: vehicle.seatCapacity,
      fuelType: vehicle.fuelType,
      vehiclePhoto: vehicle.vehiclePhoto,
      verificationStatus: vehicle.verificationStatus,
      isActive: vehicle.isActive,
      documents: documents.map(({ document, documentUrl }) => ({
        id: document.id,
        documentType: document.documentType,
        originalFileName: document.originalFileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        documentUrl,
        verificationStatus: document.verificationStatus,
        expiryDate: document.expiryDate,
        rejectionReason: document.rejectionReason,
        reviewedAt: document.reviewedAt,
        createdAt: document.createdAt,
      })),
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
}
