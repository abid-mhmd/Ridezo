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

    const userIds = [
      ...new Set(
        result.bookings.flatMap((booking) =>
          [booking.driverId, booking.passengerId].filter(Boolean),
        ),
      ),
    ];

    const users =
      userIds.length > 0 ? await this.userRepository.findByIds(userIds) : [];
    const userMap = new Map(users.map((user) => [user.id, user]));

    const bookings = await Promise.all(
      result.bookings.map(async (booking) => {
        const driver = userMap.get(booking.driverId);
        const passenger = userMap.get(booking.passengerId);

        const rawDriverPhoto =
          booking.driverSnapshot?.profilePhoto || driver?.profilePhoto || '';
        const rawVehiclePhoto = booking.vehicleSnapshot?.vehiclePhoto || '';
        const rawPassengerPhoto = passenger?.profilePhoto || '';

        const [driverPhoto, vehiclePhoto, passengerPhoto] = await Promise.all([
          rawDriverPhoto && !rawDriverPhoto.startsWith('http')
            ? this.profilePhotoStorage.getUrl(rawDriverPhoto)
            : Promise.resolve(rawDriverPhoto),
          rawVehiclePhoto && !rawVehiclePhoto.startsWith('http')
            ? this.vehiclePhotoStorage.getUrl(rawVehiclePhoto)
            : Promise.resolve(rawVehiclePhoto),
          rawPassengerPhoto && !rawPassengerPhoto.startsWith('http')
            ? this.profilePhotoStorage.getUrl(rawPassengerPhoto)
            : Promise.resolve(rawPassengerPhoto),
        ]);

        return {
          ...booking,
          driverSnapshot: {
            ...booking.driverSnapshot,
            profilePhoto: driverPhoto,
            phone: driver?.phone ?? booking.driverSnapshot?.phone ?? '',
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
