export type AdminRideStatus =
  'scheduled' | 'full' | 'started' | 'completed' | 'cancelled';

export interface AdminRideLocation {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface AdminRidePreferences {
  smoking?: string;
  pets?: string;
  seatingComfort?: string;
  climateControl?: string;
}

export interface AdminRideDriver {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  rating: number;
  reviewCount: number;
  completedRideCount: number;
  identityVerificationStatus: string;
  email?: string;
  phone?: string;
}

export interface AdminRideVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
  verificationStatus: string;
}

export interface AdminRideListItem {
  id: string;
  origin: AdminRideLocation;
  destination: AdminRideLocation;
  stopsCount: number;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
  status: AdminRideStatus;
  driver: AdminRideDriver | null;
  vehicle: AdminRideVehicle | null;
  createdAt: string;
}

export interface AdminRideDetails {
  id: string;
  origin: AdminRideLocation;
  destination: AdminRideLocation;
  stops: AdminRideLocation[];
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
  preferences: AdminRidePreferences;
  pickupInstructions?: string;
  status: AdminRideStatus;
  driver: AdminRideDriver | null;
  vehicle: AdminRideVehicle | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRideListParams {
  page: number;
  limit: number;
  search?: string;
  status?: AdminRideStatus | '';
}

export interface AdminRidePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminRideListResponse {
  rides: AdminRideListItem[];
  pagination: AdminRidePagination;
}
