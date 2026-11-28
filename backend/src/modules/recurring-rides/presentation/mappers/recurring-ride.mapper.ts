import type { RideEntity } from '../../../rides/domain/entities/ride.entity';
import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';
import type {
  RecurringRideDetailsResponseDto,
  RecurringRideResponseDto,
  RecurringSubscriptionResponseDto,
  UpcomingGeneratedRideSummaryDto,
} from './recurring-ride-response.dto';

export class RecurringRideMapper {
  static toResponse(entity: RecurringRideEntity): RecurringRideResponseDto {
    return {
      id: entity.id,
      driverId: entity.driverId,
      vehicleId: entity.vehicleId,
      driver: entity.driver,
      vehicle: entity.vehicle,
      origin: entity.origin,
      destination: entity.destination,
      stops: entity.stops,
      daysOfWeek: entity.daysOfWeek,
      departureTime: entity.departureTime,
      timezone: entity.timezone,
      startDate: entity.startDate,
      endDate: entity.endDate ?? null,
      totalSeats: entity.totalSeats,
      pricePerSeat: entity.pricePerSeat,
      preferences: entity.preferences,
      pickupInstructions: entity.pickupInstructions ?? '',
      generateAheadDays: entity.generateAheadDays,
      lastGeneratedDate: entity.lastGeneratedDate ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(
    entities: RecurringRideEntity[],
  ): RecurringRideResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUpcomingRideSummary(
    ride: RideEntity,
  ): UpcomingGeneratedRideSummaryDto {
    return {
      id: ride.id,
      occurrenceDate: ride.occurrenceDate,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      status: ride.status,
    };
  }

  static toSubscriptionResponse(
    entity: RecurringSubscriptionEntity,
  ): RecurringSubscriptionResponseDto {
    return {
      id: entity.id,
      recurringRideId: entity.recurringRideId,
      passengerId: entity.passengerId,
      driverId: entity.driverId,
      passenger: entity.passenger,
      seatsRequested: entity.seatsRequested,
      daysOfWeek: entity.daysOfWeek,
      message: entity.message ?? '',
      rejectionReason: entity.rejectionReason ?? '',
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toSubscriptionResponseList(
    entities: RecurringSubscriptionEntity[],
  ): RecurringSubscriptionResponseDto[] {
    return entities.map((entity) => this.toSubscriptionResponse(entity));
  }

  static toDetailsResponse(params: {
    schedule: RecurringRideEntity;
    upcomingRides: RideEntity[];
    subscriptions: RecurringSubscriptionEntity[];
  }): RecurringRideDetailsResponseDto {
    return {
      schedule: this.toResponse(params.schedule),
      upcomingRides: params.upcomingRides.map((ride) =>
        this.toUpcomingRideSummary(ride),
      ),
      subscriptions: this.toSubscriptionResponseList(params.subscriptions),
    };
  }
}
