import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';
import type {
  IdentityDocumentType,
  IdentityVerificationInfo,
} from '../types/identity-verification.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const IDENTITY_VERIFICATION_ENDPOINTS = {
  SUBMIT: '/users/me/identity-verification',
  ADMIN_REVIEW: (userId: string) =>
    `/admin/users/${encodeURIComponent(userId)}/identity-verification`,
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
  accessToken: string,
  userId: string,
  payload: ReviewUserIdentityPayload,
): Promise<UserVerificationData> {
  const response = await fetch(
    `${API_BASE_URL}${IDENTITY_VERIFICATION_ENDPOINTS.ADMIN_REVIEW(userId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : 'Unable to review identity verification.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  const parsed = data as ApiResponse<
    UserVerificationData & { user?: UserVerificationData }
  >;

  return parsed.data?.user ?? parsed.data;
}
