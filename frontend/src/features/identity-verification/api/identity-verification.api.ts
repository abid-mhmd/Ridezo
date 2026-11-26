import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';
import type {
  IdentityDocumentType,
  IdentityVerificationInfo,
} from '../../identity-verification/types/identity-verification.types';

const IDENTITY_VERIFICATION_ENDPOINTS = {
  SUBMIT: '/users/me/identity-verification',
  ADMIN_REVIEW: (userId: string) =>
    `/admin/users/${userId}/identity-verification`,
} as const;

interface UserVerificationData {
  identityVerification: IdentityVerificationInfo;
}

export interface ReviewUserIdentityPayload {
  decision: 'approve' | 'reject';
  rejectionReason?: string;
}

export async function submitIdentityVerification(payload: {
  documentType: IdentityDocumentType;
  consentGiven: boolean;
  file: File;
}): Promise<IdentityVerificationInfo> {
  const formData = new FormData();
  formData.append('documentType', payload.documentType);
  formData.append('consentGiven', String(payload.consentGiven));
  formData.append('document', payload.file);

  const response = await apiRequest<ApiResponse<UserVerificationData>>(
    IDENTITY_VERIFICATION_ENDPOINTS.SUBMIT,
    {
      method: 'POST',
      body: formData,
    },
  );

  return response.data.identityVerification;
}

export async function reviewUserIdentity(
  userId: string,
  payload: ReviewUserIdentityPayload,
): Promise<UserVerificationData> {
  const response = await apiRequest<ApiResponse<UserVerificationData>>(
    IDENTITY_VERIFICATION_ENDPOINTS.ADMIN_REVIEW(userId),
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}
