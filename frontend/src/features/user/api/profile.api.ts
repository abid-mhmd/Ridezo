import { apiRequest } from '../../../api/http';
import { API_ENDPOINTS } from '../../../common/constants/api_endpoints';
import type { UserProfile, UpdateProfilePayload } from '../types/profile.type';

interface MyProfileResponse {
  user: UserProfile;
}

type UpdateProfileResponse = UserProfile | MyProfileResponse;

export async function getMyProfile(): Promise<UserProfile> {
  const response = await apiRequest<MyProfileResponse>(
    API_ENDPOINTS.USERS.PROFILE,
  );
  return response.user;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const response = await apiRequest<UpdateProfileResponse>(
    API_ENDPOINTS.USERS.PROFILE,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return 'user' in response ? response.user : response;
}

export async function uploadProfilePhoto(
  file: File,
): Promise<{ message: string; profilePhoto: string }> {
  const formData = new FormData();
  formData.append('photo', file);

  return apiRequest<{ message: string; profilePhoto: string }>(
    API_ENDPOINTS.USERS.PROFILE_PHOTO,
    {
      method: 'POST',
      body: formData,
    },
  );
}

export async function removeProfilePhoto(): Promise<void> {
  await apiRequest(API_ENDPOINTS.USERS.PROFILE_PHOTO, {
    method: 'DELETE',
  });
}
