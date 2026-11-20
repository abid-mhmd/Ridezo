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
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
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

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(
    query: AdminBookingListQueryDto,
  ): Promise<ListAdminBookingsResult> {
    const { bookings, total } = await this.bookingRepository.findAll(query);

    const userIds = [
      ...new Set(
        bookings.flatMap((booking) => [booking.passengerId, booking.driverId]),
      ),
    ];

    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    const bookingItems = await Promise.all(
      bookings.map(async (booking) => {
        const passenger = userMap.get(booking.passengerId);
        const driver = userMap.get(booking.driverId);

        const driverPhoto = driver?.profilePhotoKey
          ? await this.profilePhotoStorage.getUrl(driver.profilePhotoKey)
          : (booking.driverSnapshot?.profilePhoto ?? '');

        const rawVehiclePhoto = booking.vehicleSnapshot?.vehiclePhoto ?? '';
        const vehiclePhoto =
          rawVehiclePhoto && !rawVehiclePhoto.startsWith('http')
            ? await this.vehiclePhotoStorage.getUrl(rawVehiclePhoto)
            : rawVehiclePhoto;

        const updatedBooking = {
          ...booking,
          driverSnapshot: {
            firstName: booking.driverSnapshot?.firstName ?? '',
            lastName: booking.driverSnapshot?.lastName ?? '',
            profilePhoto: driverPhoto,
          },
          vehicleSnapshot: {
            ...booking.vehicleSnapshot,
            vehiclePhoto,
          },
        };

        if (!passenger) {
          return {
            booking: updatedBooking,
            passenger: null,
          };
        }

        const passengerPhoto = passenger.profilePhotoKey
          ? await this.profilePhotoStorage.getUrl(passenger.profilePhotoKey)
          : passenger.profilePhoto;

        return {
          booking: updatedBooking,
          passenger: {
            id: passenger.id,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            email: passenger.email,
            profilePhoto: passengerPhoto,
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
