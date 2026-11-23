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
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';

@Injectable()
export class GetBookingsForUserUseCase implements IGetBookingsForUserUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
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
    const result =
      role === 'driver'
        ? await this.bookingRepository.findByDriverId(userId, query)
        : await this.bookingRepository.findByPassengerId(userId, query);

    const bookings = await Promise.all(
      result.bookings.map(async (booking) => {
        const [driverPhoto, vehiclePhoto] = await Promise.all([
          booking.driverSnapshot?.profilePhoto &&
          !booking.driverSnapshot.profilePhoto.startsWith('http')
            ? this.profilePhotoStorage.getUrl(
                booking.driverSnapshot.profilePhoto,
              )
            : Promise.resolve(booking.driverSnapshot?.profilePhoto ?? ''),
          booking.vehicleSnapshot?.vehiclePhoto &&
          !booking.vehicleSnapshot.vehiclePhoto.startsWith('http')
            ? this.vehiclePhotoStorage.getUrl(
                booking.vehicleSnapshot.vehiclePhoto,
              )
            : Promise.resolve(booking.vehicleSnapshot?.vehiclePhoto ?? ''),
        ]);

        return {
          ...booking,
          driverSnapshot: {
            ...booking.driverSnapshot,
            profilePhoto: driverPhoto,
          },
          vehicleSnapshot: {
            ...booking.vehicleSnapshot,
            vehiclePhoto,
          },
        };
      }),
    );

    return {
      bookings,
      total: result.total,
    };
  }
}
