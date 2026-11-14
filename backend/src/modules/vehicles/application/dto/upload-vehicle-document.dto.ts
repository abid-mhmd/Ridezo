import { IsEnum } from 'class-validator';
import { VehicleDocumentType } from '../../domain/enums/vehicle-document.enums';

export class UploadVehicleDocumentDto {
  @IsEnum(VehicleDocumentType)
  documentType: VehicleDocumentType;
}
