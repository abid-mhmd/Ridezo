import type {
  RideLocation,
  RidePreferences,
} from '../../../rides/domain/entities/ride.entity';
import type { RideStatus } from '../../../rides/domain/enums/ride.enums';

export class AdminRideDriverDto {
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

export class AdminRideVehicleDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
  verificationStatus: string;
}

export class AdminRideListItemDto {
  id: string;
  origin: RideLocation;
  destination: RideLocation;
  stopsCount: number;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
  status: RideStatus;
  driver: AdminRideDriverDto | null;
  vehicle: AdminRideVehicleDto | null;
  createdAt: Date;
}

export class AdminRideDetailsDto {
  id: string;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions?: string;
  status: RideStatus;
  driver: AdminRideDriverDto | null;
  vehicle: AdminRideVehicleDto | null;
  createdAt: Date;
  updatedAt: Date;
}
