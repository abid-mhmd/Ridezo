import type { BookingStatus } from '../../domain/enums/booking.enums';

export class BookingResponseDto {
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
