import { apiRequest } from '../../../api/http';
import type { UserProfile } from '../types/profile.type';

interface MyProfileResponse {
  user: UserProfile;
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await apiRequest<MyProfileResponse>('/users/me');
  return response.user;
}
