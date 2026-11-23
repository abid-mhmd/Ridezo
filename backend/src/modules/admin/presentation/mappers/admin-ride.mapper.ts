import type { RideEntity } from '../../../rides/domain/entities/ride.entity';
import type { AdminRideDetailsResult } from '../../application/interfaces/get-admin-ride-details.use-case.interface';
import type {
  AdminRideDetailsDto,
  AdminRideListItemDto,
} from '../dto/admin-ride-response.dto';

export class AdminRideMapper {
  static toListItem(ride: RideEntity): AdminRideListItemDto {
    const bookedSeats = Math.max(0, ride.totalSeats - ride.availableSeats);

    return {
      id: ride.id,
      origin: ride.origin,
      destination: ride.destination,
      stopsCount: ride.stops?.length ?? 0,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      bookedSeats,
      pricePerSeat: ride.pricePerSeat,
      status: ride.status,
      driver: ride.driver
        ? {
            id: ride.driver.id,
            firstName: ride.driver.firstName,
            lastName: ride.driver.lastName,
            profilePhoto: ride.driver.profilePhoto,
            rating: ride.driver.rating,
            reviewCount: ride.driver.reviewCount,
            completedRideCount: ride.driver.completedRideCount,
            identityVerificationStatus: ride.driver.identityVerificationStatus,
          }
        : null,
      vehicle: ride.vehicle
        ? {
            id: ride.vehicle.id,
            brand: ride.vehicle.brand,
            model: ride.vehicle.model,
            year: ride.vehicle.year,
            color: ride.vehicle.color,
            registrationNumber: ride.vehicle.registrationNumber,
            vehiclePhoto: ride.vehicle.vehiclePhoto,
            verificationStatus: ride.vehicle.verificationStatus,
          }
        : null,
      createdAt: ride.createdAt,
    };
  }

  static toListResponse(rides: RideEntity[]): AdminRideListItemDto[] {
    return rides.map((ride) => this.toListItem(ride));
  }

  static toDetailsResponse(
    result: AdminRideDetailsResult,
  ): AdminRideDetailsDto {
    const { ride, driverContact } = result;
    const bookedSeats = Math.max(0, ride.totalSeats - ride.availableSeats);

    return {
      id: ride.id,
      origin: ride.origin,
      destination: ride.destination,
      stops: ride.stops ?? [],
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      bookedSeats,
      pricePerSeat: ride.pricePerSeat,
      preferences: ride.preferences,
      pickupInstructions: ride.pickupInstructions,
      status: ride.status,
      driver: ride.driver
        ? {
            id: ride.driver.id,
            firstName: ride.driver.firstName,
            lastName: ride.driver.lastName,
            profilePhoto: ride.driver.profilePhoto,
            rating: ride.driver.rating,
            reviewCount: ride.driver.reviewCount,
            completedRideCount: ride.driver.completedRideCount,
            identityVerificationStatus: ride.driver.identityVerificationStatus,
            email: driverContact?.email,
            phone: driverContact?.phone,
          }
        : null,
      vehicle: ride.vehicle
        ? {
            id: ride.vehicle.id,
            brand: ride.vehicle.brand,
            model: ride.vehicle.model,
            year: ride.vehicle.year,
            color: ride.vehicle.color,
            registrationNumber: ride.vehicle.registrationNumber,
            vehiclePhoto: ride.vehicle.vehiclePhoto,
            verificationStatus: ride.vehicle.verificationStatus,
          }
        : null,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }
}
