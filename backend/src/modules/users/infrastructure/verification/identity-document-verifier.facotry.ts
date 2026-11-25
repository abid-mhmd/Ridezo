import { BadRequestException, Injectable } from '@nestjs/common';
import { IdentityDocumentType } from '../../domain/enums/user.enums';
import type { IIdentityDocumentVerifier } from '../../application/ports/identity-document-verifier.port';
import { DrivingLicenseOcrVerifier } from './driving-license-ocr.verifier';

@Injectable()
export class IdentityDocumentVerifierFactory {
  constructor(private readonly dlVerifier: DrivingLicenseOcrVerifier) {}

  getVerifier(type: IdentityDocumentType): IIdentityDocumentVerifier {
    switch (type) {
      case IdentityDocumentType.DRIVING_LICENSE:
        return this.dlVerifier;
      default:
        throw new BadRequestException(
          `Verification for "${type}" is not available yet.`,
        );
    }
  }
}
