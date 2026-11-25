import type {
  IdentityDocumentType,
  IdentityVerificationStatus,
} from '../../domain/enums/user.enums';

export interface VerifyIdentityDocumentInput {
  user: { firstName: string; lastName?: string };
  buffer: Buffer;
  mimeType: string;
}

export interface VerifyIdentityDocumentResult {
  status:
    | IdentityVerificationStatus.VERIFIED
    | IdentityVerificationStatus.PENDING
    | IdentityVerificationStatus.REJECTED;
  maskedDocumentNumber: string | null;
  documentHash: string | null;
  expiryDate: Date | null;
  rejectionReason: string | null;
}

export interface IIdentityDocumentVerifier {
  readonly documentType: IdentityDocumentType;
  verify(
    input: VerifyIdentityDocumentInput,
  ): Promise<VerifyIdentityDocumentResult>;
}
