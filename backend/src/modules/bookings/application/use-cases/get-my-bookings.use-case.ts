import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { IGetMyBookingsUseCase } from '../interfaces/get-my-bookings.use-case.interface';

@Injectable()
export class GetMyBookingsUseCase implements IGetMyBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(
    passengerId: string,
    query: {
      page: number;
      limit: number;
    },
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }> {
    return this.bookingRepository.findByPassengerId(passengerId, query);
  }
}
