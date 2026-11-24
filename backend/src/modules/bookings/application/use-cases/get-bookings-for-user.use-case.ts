import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import { PROFILE_PHOTO_STORAGE ,type IProfilePhotoStorage } from '../../../users/application/ports/profile-photo-storage';
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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(
    userId: string,
    query: { page: number; limit: number },
    role: BookingListRole,
  ): Promise<{ bookings: BookingEntity[]; total: number }> {
    const result =
      role === 'driver'
        ? await this.bookingRepository.findByDriverId(userId, query)
        : await this.bookingRepository.findByPassengerId(userId, query);

    if (result.bookings.length === 0) {
      return result;
    }

    const userIds = [
      ...new Set(
        result.bookings.map((b) =>
          role === 'driver' ? b.passengerId : b.driverId,
        ),
      ),
    ];

    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedBookings = await Promise.all(
      result.bookings.map(async (booking) => {
        if (role === 'driver') {
          const passenger = userMap.get(booking.passengerId);
          if (!passenger) return booking;

          const profilePhoto =
            passenger.profilePhoto && !passenger.profilePhoto.startsWith('http')
              ? await this.profilePhotoStorage.getUrl(passenger.profilePhoto)
              : (passenger.profilePhoto ?? '');

          return {
            ...booking,
            passengerSnapshot: {
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              email: passenger.email,
              phone: passenger.phone,
              profilePhoto,
            },
          };
        }

        const driver = userMap.get(booking.driverId);
        return {
          ...booking,
          driverSnapshot: {
            ...booking.driverSnapshot,
            phone: driver?.phone ?? booking.driverSnapshot.phone ?? '',
          },
        };
      }),
    );

    return {
      bookings: enrichedBookings,
      total: result.total,
    };
  }
}
