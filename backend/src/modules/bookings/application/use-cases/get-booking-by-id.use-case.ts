import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
import type { IGetBookingByIdUseCase } from '../interfaces/get-booking-by-id.use-case.interface';

export const GET_BOOKING_BY_ID_USE_CASE = Symbol('GET_BOOKING_BY_ID_USE_CASE');

@Injectable()
export class GetBookingByIdUseCase implements IGetBookingByIdUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(bookingId: string, userId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.passengerId !== userId && booking.driverId !== userId) {
      throw new ForbiddenException('You do not have access to this booking.');
    }

    const [driverPhoto, vehiclePhoto] = await Promise.all([
      booking.driverSnapshot?.profilePhoto &&
      !booking.driverSnapshot.profilePhoto.startsWith('http')
        ? this.profilePhotoStorage.getUrl(booking.driverSnapshot.profilePhoto)
        : Promise.resolve(booking.driverSnapshot?.profilePhoto ?? ''),
      booking.vehicleSnapshot?.vehiclePhoto &&
      !booking.vehicleSnapshot.vehiclePhoto.startsWith('http')
        ? this.vehiclePhotoStorage.getUrl(booking.vehicleSnapshot.vehiclePhoto)
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
  }
}
