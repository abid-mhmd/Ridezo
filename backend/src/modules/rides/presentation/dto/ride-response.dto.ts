import type { RideStatus } from '../../domain/enums/ride.enums';

import type {
  SmokingPreference,
  PetPreference,
  SeatingComfortPreference,
  ClimateControlPreference,
} from '../../../users/domain/enums/user.enums';

export class RideResponseDto {
  id: string;
  driverId: string;
  vehicleId: string;
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
