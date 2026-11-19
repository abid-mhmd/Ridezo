import { BookingStatus } from '../../../bookings/domain/enums/booking.enums';
import type {
  BookingLocationSnapshot,
  BookingDriverSnapshot,
  BookingVehicleSnapshot,
} from '../../../bookings/domain/entities/booking.entity';

export class AdminBookingPassengerDto {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profilePhoto: string;
}

export class AdminBookingResponseDto {
  id: string;
  rideId: string;
  passenger: AdminBookingPassengerDto | null;
  driver: BookingDriverSnapshot;
  vehicle: BookingVehicleSnapshot;
  ride: {
    origin: BookingLocationSnapshot;
    destination: BookingLocationSnapshot;
    departureTime: Date;
  };
  seatsRequested: number;
  pricePerSeat: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
