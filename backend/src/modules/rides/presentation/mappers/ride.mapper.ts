import type { RideEntity } from '../../domain/entities/ride.entity';
import type { RideResponseDto } from '../dto/ride-response.dto';

export class RideMapper {
  static toResponse(ride: RideEntity): RideResponseDto {
    return {
      id: ride.id,
      driverId: ride.driverId,
      vehicleId: ride.vehicleId,
      origin: {
        placeId: ride.origin.placeId,
        name: ride.origin.name,
        address: ride.origin.address,
        coordinates: {
          type: ride.origin.coordinates.type,
          coordinates: [...ride.origin.coordinates.coordinates],
        },
      },
      destination: {
        placeId: ride.destination.placeId,
        name: ride.destination.name,
        address: ride.destination.address,
        coordinates: {
          type: ride.destination.coordinates.type,
          coordinates: [...ride.destination.coordinates.coordinates],
        },
      },
      stops: ride.stops.map((stop) => ({
        placeId: stop.placeId,
        name: stop.name,
        address: stop.address,
        coordinates: {
          type: stop.coordinates.type,
          coordinates: [...stop.coordinates.coordinates],
        },
      })),
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      preferences: {
        ...ride.preferences,
      },
      pickupInstructions: ride.pickupInstructions,
      status: ride.status,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }

  static toResponseList(rides: RideEntity[]): RideResponseDto[] {
    return rides.map((ride) => this.toResponse(ride));
  }
}
