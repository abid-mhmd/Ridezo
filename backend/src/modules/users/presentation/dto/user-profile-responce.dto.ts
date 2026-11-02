export interface UserProfileResponseDto {
  id: string;
  firstName: string;
  lastName?: string;
  about?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  languages: string[];
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  role: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  status: string;
}
