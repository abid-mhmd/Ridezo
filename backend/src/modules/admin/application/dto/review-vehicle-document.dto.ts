import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentVerificationStatus } from '../../../vehicles/domain/enums/vehicle-document.enums';

export class ReviewVehicleDocumentDto {
  @IsEnum(DocumentVerificationStatus)
  status: DocumentVerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
