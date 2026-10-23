import { apiRequest } from '../../../api/http';
import type { UserProfile, UpdateProfilePayload } from '../types/profile.type';

interface MyProfileResponse {
  user: UserProfile;
}

type UpdateProfileResponse = UserProfile | MyProfileResponse;

export async function getMyProfile(): Promise<UserProfile> {
  const response = await apiRequest<MyProfileResponse>('/users/me');
  return response.user;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const response = await apiRequest<UpdateProfileResponse>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return 'user' in response ? response.user : response;
}

export async function uploadProfilePhoto(
  file: File,
): Promise<{ message: string; profilePhoto: string }> {
  const formData = new FormData();
  formData.append('photo', file);

  return apiRequest<{ message: string; profilePhoto: string }>(
    '/users/profile/photo',
    {
      method: 'POST',
      body: formData,
    },
  );
}

export async function removeProfilePhoto(): Promise<void> {
  await apiRequest('/users/profile/photo', {
    method: 'DELETE',
  });
}
