import { Inject, Injectable } from '@nestjs/common';

import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';

import type { BookingEntity } from '../../domain/entities/booking.entity';

import type {
  IGetBookingsForUserUseCase,
  BookingListRole,
} from '../interfaces/get-my-bookings-for-user.use-case.interface';

@Injectable()
export class GetBookingsForUserUseCase implements IGetBookingsForUserUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(
    userId: string,
    query: {
      page: number;
      limit: number;
    },
    role: BookingListRole,
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }> {
    if (role === 'driver') {
      return this.bookingRepository.findByDriverId(userId, query);
    }

    return this.bookingRepository.findByPassengerId(userId, query);
  }
}
