import { API_ENDPOINTS } from '../../../../common/constants/api_endpoints';
import type { ApiResponse } from '../../../../common/types/api-response.types';
import type {
  AdminVehicleDetails,
  AdminVehicleListParams,
  AdminVehicleListResponse,
  AdminVehicleVerificationStatus,
  ReviewVehicleDocumentPayload,
  UpdateVehicleStatusPayload,
} from '../types/admin-vehicle.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return fallback;
}

export async function getAdminVehicles(
  accessToken: string,
  params: AdminVehicleListParams,
): Promise<AdminVehicleListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.VEHICLES}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Unable to load vehicles. Please try again.'),
    );
  }

  const result = data as ApiResponse<AdminVehicleListResponse['vehicles']>;

  return {
    vehicles: result.data,
    pagination: result.meta!,
  };
}

export async function getAdminVehicleDetails(
  accessToken: string,
  vehicleId: string,
): Promise<AdminVehicleDetails> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.VEHICLE_BY_ID(vehicleId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        data,
        'Unable to load vehicle details. Please try again.',
      ),
    );
  }

  const result = data as ApiResponse<AdminVehicleDetails>;
  return result.data;
}

export async function reviewAdminVehicleDocument(
  accessToken: string,
  vehicleId: string,
  documentId: string,
  payload: ReviewVehicleDocumentPayload,
): Promise<{
  id: string;
  verificationStatus: string;
  rejectionReason: string | null;
}> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.REVIEW_VEHICLE_DOCUMENT(
      vehicleId,
      documentId,
    )}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        data,
        'Unable to update document status. Please try again.',
      ),
    );
  }

  const result = data as ApiResponse<{
    id: string;
    verificationStatus: string;
    rejectionReason: string | null;
  }>;
  return result.data;
}

export async function updateAdminVehicleStatus(
  accessToken: string,
  vehicleId: string,
  payload: UpdateVehicleStatusPayload,
): Promise<{ id: string; verificationStatus: AdminVehicleVerificationStatus }> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.UPDATE_VEHICLE_STATUS(vehicleId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        data,
        'Unable to update vehicle status. Please try again.',
      ),
    );
  }

  const result = data as ApiResponse<{
    id: string;
    verificationStatus: AdminVehicleVerificationStatus;
  }>;
  return result.data;
}
