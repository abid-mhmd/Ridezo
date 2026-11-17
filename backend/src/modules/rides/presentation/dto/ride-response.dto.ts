import type { RideStatus } from '../../domain/enums/ride.enums';

import type {
  SmokingPreference,
  PetPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
} from '../../../users/domain/enums/user.enums';

export class RideDriverSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  rating: number;
  reviewCount: number;
  completedRideCount: number;
  identityVerificationStatus: string;
  languages: string[];
}

export class RideVehicleSummaryDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehiclePhoto: string;
  verificationStatus: string;
}

export class RideResponseDto {
  id: string;
  driverId: string;
  vehicleId: string;
  driver?: RideDriverSummaryDto;
  vehicle?: RideVehicleSummaryDto;
  origin: {
    placeId: string;
    name: string;
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  destination: {
    placeId: string;
    name: string;
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  stops: {
    placeId: string;
    name: string;
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  }[];
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  preferences: {
    smoking?: SmokingPreference;
    pets?: PetPreference;
    seatingComfort?: SeatingComfortPreference;
    climateControl?: ClimateControlPreference;
  };
  pickupInstructions?: string;
  status: RideStatus;
  createdAt: Date;
  updatedAt: Date;
}
