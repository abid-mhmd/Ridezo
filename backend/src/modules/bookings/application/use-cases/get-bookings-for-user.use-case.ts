import { Inject, Injectable } from '@nestjs/common';

import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
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

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  private async resolvePhotoUrl(
    value: string | undefined,
    storage: { getUrl(objectKey: string): Promise<string> },
  ): Promise<string> {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    return storage.getUrl(value);
  }

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
        const driver =
          role === 'passenger' ? userMap.get(booking.driverId) : undefined;
        const passenger =
          role === 'driver' ? userMap.get(booking.passengerId) : undefined;

        const [driverPhoto, vehiclePhoto, passengerPhoto] = await Promise.all([
          this.resolvePhotoUrl(
            driver?.profilePhoto || booking.driverSnapshot?.profilePhoto,
            this.profilePhotoStorage,
          ),
          this.resolvePhotoUrl(
            booking.vehicleSnapshot?.vehiclePhoto,
            this.vehiclePhotoStorage,
          ),
          passenger
            ? this.resolvePhotoUrl(
                passenger.profilePhoto,
                this.profilePhotoStorage,
              )
            : Promise.resolve(''),
        ]);

        return {
          ...booking,
          driverSnapshot: {
            ...booking.driverSnapshot,
            profilePhoto: driverPhoto,
            phone: driver?.phone ?? booking.driverSnapshot?.phone ?? '',
          },
          vehicleSnapshot: {
            ...booking.vehicleSnapshot,
            vehiclePhoto,
          },
          ...(passenger && {
            passengerSnapshot: {
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              email: passenger.email,
              phone: passenger.phone,
              profilePhoto: passengerPhoto,
            },
          }),
        };
      }),
    );

    return {
      bookings: enrichedBookings,
      total: result.total,
    };
  }
}
