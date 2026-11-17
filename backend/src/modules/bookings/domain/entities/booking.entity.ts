import { BookingStatus } from '../enums/booking.enums';

export interface BookingEntity {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  seatsRequested: number;
  pricePerSeat: number;
  totalPrice: number;
  message?: string;
  rejectionReason?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
