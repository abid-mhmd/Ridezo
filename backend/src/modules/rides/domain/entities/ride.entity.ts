import { RideStatus } from '../enums/ride.enums';

import type {
  SmokingPreference,
  PetPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
} from '../../../users/domain/enums/user.enums';

export interface RideCoordinates {
  type: 'Point';
  coordinates: [number, number];
}

export interface RideLocation {
  placeId: string;
  name: string;
  address: string;
  coordinates: RideCoordinates;
}

export interface RidePreferences {
  smoking?: SmokingPreference;
  pets?: PetPreference;
  seatingComfort?: SeatingComfortPreference;
  climateControl?: ClimateControlPreference;
}

export interface RideEntity {
  id: string;
  driverId: string;
  vehicleId: string;
  driver?: RideDriverSummary;
  vehicle?: RideVehicleSummary;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions?: string;
  status: RideStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RideDriverSummary {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  profilePhotoKey: string;

  rating: number;
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
  vehiclePhoto: string;
  vehiclePhotoKey: string;
  verificationStatus: string;
}
