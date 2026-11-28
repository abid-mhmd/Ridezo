import type {
  RideDriverSummary,
  RideLocation,
  RidePreferences,
  RideVehicleSummary,
} from '../../../rides/domain/entities/ride.entity';
import type { RecurringRideStatus } from '../enums/recurring-ride.enums';

export interface RecurringRideEntity {
  id: string;
  driverId: string;
  vehicleId: string;
  driver?: RideDriverSummary;
  vehicle?: RideVehicleSummary;
  origin: RideLocation;
  destination: RideLocation;
  stops: RideLocation[];
  daysOfWeek: number[];
  departureTime: string; // "HH:mm" in 24-hour IST format
  timezone: string;
  startDate: Date;
  endDate?: Date | null;
  totalSeats: number;
  pricePerSeat: number;
  preferences: RidePreferences;
  pickupInstructions?: string;
  generateAheadDays: number;
  lastGeneratedDate?: Date | null;
  status: RecurringRideStatus;
  createdAt: Date;
  updatedAt: Date;
}
