import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../../bookings/domain/repositories/booking.repository';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import type { AdminBookingListQueryDto } from '../dto/admin-booking-query.dto';
import type {
  ListAdminBookingsResult,
  IListAdminBookingsUseCase,
} from '../interfaces/list-admin-booking.use-case.interface';

@Injectable()
export class ListAdminBookingsUseCase implements IListAdminBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(
    query: AdminBookingListQueryDto,
  ): Promise<ListAdminBookingsResult> {
    const { bookings, total } = await this.bookingRepository.findAll(query);

    const passengerIds = [
      ...new Set(bookings.map((booking) => booking.passengerId)),
    ];

    const passengers = await this.userRepository.findByIds(passengerIds);

    const passengerMap = new Map(
      passengers.map((passenger) => [passenger.id, passenger]),
    );

    const bookingItems = await Promise.all(
      bookings.map(async (booking) => {
        const passenger = passengerMap.get(booking.passengerId);

        if (!passenger) {
          return {
            booking,
            passenger: null,
          };
        }

        const profilePhoto = passenger.profilePhotoKey
          ? await this.profilePhotoStorage.getUrl(passenger.profilePhotoKey)
          : passenger.profilePhoto;

        return {
          booking,
          passenger: {
            id: passenger.id,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            email: passenger.email,
            profilePhoto,
          },
        };
      }),
    );

    return {
      bookings: bookingItems,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
