import { IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { IdentityDocumentType } from '../../domain/enums/user.enums';

export class SubmitIdentityVerificationDto {
  @IsEnum(IdentityDocumentType)
  documentType: IdentityDocumentType;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  consentGiven: boolean;
}
