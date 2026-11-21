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
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
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

    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(
    query: AdminBookingListQueryDto,
  ): Promise<ListAdminBookingsResult> {
    const trimmedSearch = query.search?.trim();
    let matchingPassengerIds: string[] = [];

    if (trimmedSearch) {
      const matchedUsers = await this.userRepository.listUsers({
        page: 1,
        limit: 100,
        search: trimmedSearch,
      });
      matchingPassengerIds = matchedUsers.users.map((user) => user.id);
    }

    const { bookings, total } = await this.bookingRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: trimmedSearch,
      passengerIds: matchingPassengerIds,
    });

    const userIds = [
      ...new Set(
        bookings.flatMap((booking) =>
          [booking.passengerId, booking.driverId].filter(Boolean),
        ),
      ),
    ];

    const driverIds = [
      ...new Set(bookings.map((booking) => booking.driverId).filter(Boolean)),
    ];

    const [users, driverVehiclesEntries] = await Promise.all([
      this.userRepository.findByIds(userIds),
      Promise.all(
        driverIds.map(
          async (driverId) =>
            [
              driverId,
              await this.vehicleRepository.findByOwnerId(driverId),
            ] as const,
        ),
      ),
    ]);

    const userMap = new Map(users.map((user) => [user.id, user]));
    const vehiclesByDriverMap = new Map(driverVehiclesEntries);

    const bookingItems = await Promise.all(
      bookings.map(async (booking) => {
        const passenger = userMap.get(booking.passengerId);
        const driver = userMap.get(booking.driverId);

        const driverPhotoKey =
          driver?.profilePhoto || booking.driverSnapshot?.profilePhoto || '';
        const driverPhoto =
          driverPhotoKey && !driverPhotoKey.startsWith('http')
            ? await this.profilePhotoStorage.getUrl(driverPhotoKey)
            : driverPhotoKey;

        const driverVehicles = vehiclesByDriverMap.get(booking.driverId) ?? [];
        const snapshotReg = booking.vehicleSnapshot?.registrationNumber ?? '';
        const matchedVehicle =
          driverVehicles.find(
            (v) =>
              snapshotReg &&
              v.registrationNumber.toLowerCase() === snapshotReg.toLowerCase(),
          ) ?? driverVehicles[0];

        const rawVehiclePhoto =
          booking.vehicleSnapshot?.vehiclePhoto ||
          matchedVehicle?.vehiclePhoto ||
          '';

        const vehiclePhoto =
          rawVehiclePhoto && !rawVehiclePhoto.startsWith('http')
            ? await this.vehiclePhotoStorage.getUrl(rawVehiclePhoto)
            : rawVehiclePhoto;

        const updatedBooking = {
          ...booking,
          driverSnapshot: {
            firstName:
              booking.driverSnapshot?.firstName || driver?.firstName || '',
            lastName:
              booking.driverSnapshot?.lastName || driver?.lastName || '',
            email: driver?.email ?? '',
            phone: driver?.phone ?? '',
            profilePhoto: driverPhoto,
          },
          vehicleSnapshot: {
            brand:
              booking.vehicleSnapshot?.brand || matchedVehicle?.brand || '',
            model:
              booking.vehicleSnapshot?.model || matchedVehicle?.model || '',
            year: booking.vehicleSnapshot?.year || matchedVehicle?.year || 0,
            color:
              booking.vehicleSnapshot?.color || matchedVehicle?.color || '',
            registrationNumber:
              booking.vehicleSnapshot?.registrationNumber ||
              matchedVehicle?.registrationNumber ||
              '',
            vehiclePhoto,
          },
        };

        if (!passenger) {
          return {
            booking: updatedBooking,
            passenger: null,
          };
        }

        const passengerPhoto =
          passenger.profilePhoto && !passenger.profilePhoto.startsWith('http')
            ? await this.profilePhotoStorage.getUrl(passenger.profilePhoto)
            : passenger.profilePhoto;

        return {
          booking: updatedBooking,
          passenger: {
            id: passenger.id,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            email: passenger.email,
            phone: passenger.phone,
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
