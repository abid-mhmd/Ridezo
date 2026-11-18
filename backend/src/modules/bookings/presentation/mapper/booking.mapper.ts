import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { BookingResponseDto } from '../dto/booking.respose.dto';

export class BookingMapper {
  static toResponse(booking: BookingEntity): BookingResponseDto {
    return {
      id: booking.id,
      rideId: booking.rideId,
      passengerId: booking.passengerId,
      driverId: booking.driverId,

      seatsRequested: booking.seatsRequested,
      pricePerSeat: booking.pricePerSeat,
      totalPrice: booking.totalPrice,

      driverSnapshot: booking.driverSnapshot,
      vehicleSnapshot: booking.vehicleSnapshot,
      rideSnapshot: booking.rideSnapshot,

      message: booking.message,
      rejectionReason: booking.rejectionReason,
      status: booking.status,

      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static toResponseList(bookings: BookingEntity[]): BookingResponseDto[] {
    return bookings.map((booking) => this.toResponse(booking));
  }
}
