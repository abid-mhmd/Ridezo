import { BookingStatus } from '../enums/booking.enums';
import type { BookingEntity } from '../entities/booking.entity';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export type CreateBookingData = Omit<
  BookingEntity,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface ListBookingsQuery {
  page: number;
  limit: number;
  search?: string;
  passengerIds?: string[];
}

export interface UpdateBookingStatusData {
  status: BookingStatus;
  rejectionReason?: string;
}

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<BookingEntity>;

  findById(bookingId: string): Promise<BookingEntity | null>;

  findActiveByPassengerAndRide(
    passengerId: string,
    rideId: string,
  ): Promise<BookingEntity | null>;

  findByPassengerId(
    passengerId: string,
    query: ListBookingsQuery,
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }>;

  findByDriverId(
    driverId: string,
    query: ListBookingsQuery,
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }>;

  updateStatus(
    bookingId: string,
    expectedStatus: BookingStatus,
    data: UpdateBookingStatusData,
  ): Promise<BookingEntity | null>;

  findAll(query: ListBookingsQuery): Promise<{
    bookings: BookingEntity[];
    total: number;
  }>;
}
