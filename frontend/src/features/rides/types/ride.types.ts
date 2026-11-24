export type RideStatus =
  'scheduled' | 'full' | 'started' | 'completed' | 'cancelled';

export interface RideLocation {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface RidePreferences {
  smoking?: 'non-smoking' | 'smoking-allowed' | 'no-preference';
  pets?: 'allowed' | 'not-allowed' | 'no-preference';
  seatingComfort?: 'window' | 'middle' | 'aisle' | 'no-preference';
  climateControl?: 'ac-preferred' | 'non-ac-preferred' | 'no-preference';
}

export interface RideDriverSummary {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  rating: number;
  phone?: string;
  reviewCount: number;
  completedRideCount: number;
  identityVerificationStatus: string;
  languages: string[];
}

export interface RideVehicleSummary {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
  verificationStatus: string;
}

export interface Ride {
  id: string;
  driverId: string;
  vehicleId: string;
  driver?: RideDriverSummary;
  vehicle?: RideVehicleSummary;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions?: string;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SearchRidesParams {
  originLongitude: number;
  originLatitude: number;
  destinationLongitude: number;
  destinationLatitude: number;
  departureDate: string;
  seats: number;
  minPrice?: number;
  maxPrice?: number;
  departureWindows?: ('morning' | 'afternoon' | 'evening')[];
  sortBy?: 'departure' | 'price-low' | 'price-high';
  page?: number;
  limit?: number;
}

export interface SearchRidesResult {
  rides: Ride[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRidePayload {
  vehicleId: string;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  departureTime: string;
  totalSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions?: string;
}

export interface MyRidesResult {
  rides: Ride[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateRidePayload {
  origin?: RideLocation;
  destination?: RideLocation;
  stops?: RideLocation[];
  departureTime?: string;
  pricePerSeat?: number;
  preferences?: RidePreferences;
  pickupInstructions?: string;
}
