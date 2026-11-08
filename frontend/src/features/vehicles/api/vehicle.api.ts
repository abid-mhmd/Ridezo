import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type {
  Vehicle,
  AddVehiclePayload,
  UpdateVehiclePayload,
} from '../types/vehicle.types';

const VEHICLE_ENDPOINTS = {
  ROOT: '/vehicles',
  BY_ID: (vehicleId: string) => `/vehicles/${encodeURIComponent(vehicleId)}`,
  PHOTO: '/vehicles/photo',
} as const;

export async function getMyVehicles(): Promise<Vehicle[]> {
  const response = await apiRequest<ApiResponse<Vehicle[]>>(
    VEHICLE_ENDPOINTS.ROOT,
  );

  return response.data;
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle> {
  const response = await apiRequest<ApiResponse<Vehicle>>(
    VEHICLE_ENDPOINTS.BY_ID(vehicleId),
  );

  return response.data;
}

export async function addVehicle(payload: AddVehiclePayload): Promise<Vehicle> {
  const response = await apiRequest<ApiResponse<Vehicle>>(
    VEHICLE_ENDPOINTS.ROOT,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function uploadVehiclePhoto(file: File): Promise<string> {
  const formData = new FormData();

  formData.append('photo', file);

  const response = await apiRequest<ApiResponse<{ vehiclePhoto: string }>>(
    VEHICLE_ENDPOINTS.PHOTO,
    {
      method: 'POST',
      body: formData,
    },
  );

  return response.data.vehiclePhoto;
}

export async function updateVehicle(
  vehicleId: string,
  payload: UpdateVehiclePayload,
): Promise<Vehicle> {
  const response = await apiRequest<ApiResponse<Vehicle>>(
    VEHICLE_ENDPOINTS.BY_ID(vehicleId),
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deactivateVehicle(vehicleId: string): Promise<void> {
  await apiRequest<ApiResponse<undefined>>(VEHICLE_ENDPOINTS.BY_ID(vehicleId), {
    method: 'DELETE',
  });
}
