import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  OCR_SERVICE,
  type IOcrService,
} from '../../../../infrastructure/ocr/ocr.port';
import { DocumentTextUtil } from '../../../../common/utils/document-text.util';
import {
  DRIVING_LICENSE_KEYWORDS,
  IDENTITY_VERIFICATION_RULES,
  INDIAN_DL_REGEX,
  INDIAN_STATE_CODES,
} from '../../domain/constants/identity-verification.constants';
import {
  IdentityDocumentType,
  IdentityVerificationStatus,
} from '../../domain/enums/user.enums';
import type {
  IIdentityDocumentVerifier,
  VerifyIdentityDocumentInput,
  VerifyIdentityDocumentResult,
} from '../../application/ports/identity-document-verifier.port';

@Injectable()
export class DrivingLicenseOcrVerifier implements IIdentityDocumentVerifier {
  readonly documentType = IdentityDocumentType.DRIVING_LICENSE;

  constructor(
    @Inject(OCR_SERVICE)
    private readonly ocrService: IOcrService,
    private readonly configService: ConfigService,
  ) {}

  async verify(
    input: VerifyIdentityDocumentInput,
  ): Promise<VerifyIdentityDocumentResult> {
    const rawText = await this.ocrService.extractText(
      input.buffer,
      input.mimeType,
    );
    const normalizedText = DocumentTextUtil.normalize(rawText);

    if (!normalizedText) {
      return {
        status: IdentityVerificationStatus.PENDING,
        maskedDocumentNumber: null,
        documentHash: null,
        expiryDate: null,
        rejectionReason: null,
      };
    }

    // 1. Extract & validate Indian DL number
    const dlMatch = normalizedText.match(INDIAN_DL_REGEX);
    const stateCode = dlMatch?.[1];
    const isValidDlNumber = Boolean(
      dlMatch && stateCode && INDIAN_STATE_CODES.has(stateCode),
    );
    const rawDlNumber = dlMatch
      ? `${dlMatch[1]}${dlMatch[2]}${dlMatch[3]}${dlMatch[4]}`
      : null;

    const pepper =
      this.configService.get<string>('IDENTITY_HASH_PEPPER') ?? 'ridezo-ekyc';
    const maskedDocumentNumber = rawDlNumber
      ? DocumentTextUtil.maskDocumentNumber(rawDlNumber)
      : null;
    const documentHash = rawDlNumber
      ? DocumentTextUtil.hashDocumentNumber(rawDlNumber, pepper)
      : null;

    // 2. Check expiry date (hard reject if expired)
    const dates = DocumentTextUtil.extractDates(normalizedText);
    const expiryDate =
      dates.length > 0
        ? dates.reduce((latest, curr) => (curr > latest ? curr : latest))
        : null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (expiryDate && expiryDate < today) {
      return {
        status: IdentityVerificationStatus.REJECTED,
        maskedDocumentNumber,
        documentHash: null,
        expiryDate,
        rejectionReason: 'Driving license has expired.',
      };
    }

    // 3. Check DL keywords & profile name match
    const keywordMatches = DRIVING_LICENSE_KEYWORDS.filter((kw) =>
      normalizedText.includes(kw),
    ).length;

    const nameMatchRatio = DocumentTextUtil.calculateNameMatchRatio(
      normalizedText,
      input.user.firstName,
      input.user.lastName,
    );

    const isAutoVerified =
      isValidDlNumber &&
      keywordMatches >= IDENTITY_VERIFICATION_RULES.MIN_KEYWORDS_REQUIRED &&
      expiryDate !== null &&
      nameMatchRatio >= IDENTITY_VERIFICATION_RULES.MIN_NAME_MATCH_RATIO;

    return {
      status: isAutoVerified
        ? IdentityVerificationStatus.VERIFIED
        : IdentityVerificationStatus.PENDING,
      maskedDocumentNumber,
      documentHash,
      expiryDate,
      rejectionReason: null,
    };
  }
}
