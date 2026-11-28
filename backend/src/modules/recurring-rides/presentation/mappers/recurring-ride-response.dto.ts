import type {
  RideDriverSummary,
  RideLocation,
  RidePreferences,
  RideVehicleSummary,
} from '../../../rides/domain/entities/ride.entity';
import type { RideStatus } from '../../../rides/domain/enums/ride.enums';
import type { RecurringPassengerSummary } from '../../domain/entities/recurring-subscription.entity';
import type {
  RecurringRideStatus,
  RecurringSubscriptionStatus,
} from '../../domain/enums/recurring-ride.enums';

export class RecurringRideResponseDto {
  id: string;
  driverId: string;
  vehicleId: string;
  driver?: RideDriverSummary;
  vehicle?: RideVehicleSummary;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  daysOfWeek: number[];
  departureTime: string;
  timezone: string;
  startDate: Date;
  endDate: Date | null;
  totalSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions: string;
  generateAheadDays: number;
  lastGeneratedDate: Date | null;
  status: RecurringRideStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class UpcomingGeneratedRideSummaryDto {
  id: string;
  occurrenceDate?: string;
  departureTime: Date;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  status: RideStatus;
}

export class RecurringSubscriptionResponseDto {
  id: string;
  recurringRideId: string;
  passengerId: string;
  driverId: string;
  passenger?: RecurringPassengerSummary;
  seatsRequested: number;
  daysOfWeek: number[];
  message: string;
  rejectionReason: string;
  status: RecurringSubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class RecurringRideDetailsResponseDto {
  schedule: RecurringRideResponseDto;
  upcomingRides: UpcomingGeneratedRideSummaryDto[];
  subscriptions: RecurringSubscriptionResponseDto[];
}
