import type { AdminBookingListItem } from '../../application/interfaces/list-admin-booking.use-case.interface';
import type { AdminBookingResponseDto } from '../dto/admin-booking-respose.dto';

export class AdminBookingMapper {
  static toResponse(item: AdminBookingListItem): AdminBookingResponseDto {
    const { booking, passenger } = item;

    return {
      id: booking.id,
      rideId: booking.rideId,
      passenger,
      driver: booking.driverSnapshot,
      vehicle: booking.vehicleSnapshot,
      ride: {
        origin: booking.rideSnapshot.origin,
        destination: booking.rideSnapshot.destination,
        departureTime: booking.rideSnapshot.departureTime,
      },
      seatsRequested: booking.seatsRequested,
      pricePerSeat: booking.pricePerSeat,
      totalPrice: booking.totalPrice,

      status: booking.status,

      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static toResponseList(
    items: AdminBookingListItem[],
  ): AdminBookingResponseDto[] {
    return items.map((item) => this.toResponse(item));
  }
}
