import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type {
  UploadedVehicleDocument,
  VehicleDocument,
  VehicleDocumentType,
  VerifyVehicleDocumentResponse,
} from '../types/vehicle-document.types';

const VEHICLE_DOCUMENT_ENDPOINTS = {
  ROOT: (vehicleId: string) =>
    `/vehicles/${encodeURIComponent(vehicleId)}/documents`,
  VERIFY: (vehicleId: string, documentId: string) =>
    `/vehicles/${encodeURIComponent(vehicleId)}/documents/${encodeURIComponent(documentId)}/verify`,
} as const;

// Get uploaded documents
export async function getVehicleDocuments(
  vehicleId: string,
): Promise<VehicleDocument[]> {
  const response = await apiRequest<ApiResponse<VehicleDocument[]>>(
    VEHICLE_DOCUMENT_ENDPOINTS.ROOT(vehicleId),
  );

  return response.data;
}

// Upload a document
export async function uploadVehicleDocument(
  vehicleId: string,
  documentType: VehicleDocumentType,
  file: File,
): Promise<UploadedVehicleDocument> {
  const formData = new FormData();

  formData.append('documentType', documentType);
  formData.append('document', file);

  const response = await apiRequest<ApiResponse<UploadedVehicleDocument>>(
    VEHICLE_DOCUMENT_ENDPOINTS.ROOT(vehicleId),
    {
      method: 'POST',
      body: formData,
    },
  );

  return response.data;
}

// Trigger document verification
export async function verifyVehicleDocument(
  vehicleId: string,
  documentId: string,
): Promise<VerifyVehicleDocumentResponse> {
  const response = await apiRequest<ApiResponse<VerifyVehicleDocumentResponse>>(
    VEHICLE_DOCUMENT_ENDPOINTS.VERIFY(vehicleId, documentId),
    {
      method: 'POST',
    },
  );

  return response.data;
}
