import { Inject, Injectable, Logger } from '@nestjs/common';
import { Money } from '../../../../common/domain/value-objects/money.vo';
import { BookingStatus } from '../../../bookings/domain/enums/booking.enums';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../../bookings/domain/repositories/booking.repository';
import { RideStatus } from '../../../rides/domain/enums/ride.enums';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../../../vehicles/domain/repositories/vehicle.repository';
import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import {
  RECURRING_SUBSCRIPTION_REPOSITORY,
  type IRecurringSubscriptionRepository,
} from '../../domain/repositories/recurring-subscription.repository';
import type {
  GenerateUpcomingResult,
  IGenerateUpcomingRidesUseCase,
} from '../interfaces/generate-upcoming-rides.use-case.interface';
import { computeUpcomingOccurrences } from '../utils/recurring-schedule-date.util';

@Injectable()
export class GenerateUpcomingRidesUseCase implements IGenerateUpcomingRidesUseCase {
  private readonly _logger = new Logger(GenerateUpcomingRidesUseCase.name);

  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
    @Inject(RIDE_REPOSITORY)
    private readonly _rideRepository: IRideRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly _bookingRepository: IBookingRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly _vehicleRepository: IVehicleRepository,
  ) {}

  async generateAllActive(): Promise<GenerateUpcomingResult> {
    const now = new Date();
    const activeSchedules =
      await this._recurringRideRepository.findActiveForGeneration(now);
    let ridesCreated = 0;
    let autoBookingsCreated = 0;

    for (const schedule of activeSchedules) {
      try {
        const result = await this.generateForSchedule(schedule);
        ridesCreated += result.ridesCreated;
        autoBookingsCreated += result.autoBookingsCreated;
      } catch (error) {
        this._logger.error(
          `Failed generating rides for schedule ${schedule.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
    return {
      schedulesProcessed: activeSchedules.length,
      ridesCreated,
      autoBookingsCreated,
    };
  }

  async generateForSchedule(
    schedule: RecurringRideEntity,
  ): Promise<{ ridesCreated: number; autoBookingsCreated: number }> {
    const vehicle = await this._vehicleRepository.findById(schedule.vehicleId);
    if (
      !vehicle ||
      !vehicle.isActive ||
      String(vehicle.verificationStatus) !== 'approved'
    ) {
      this._logger.warn(
        `Skipping schedule ${schedule.id}: vehicle ${schedule.vehicleId} is inactive or unverified.`,
      );
      return { ridesCreated: 0, autoBookingsCreated: 0 };
    }

    const occurrences = computeUpcomingOccurrences({
      daysOfWeek: schedule.daysOfWeek,
      departureTime: schedule.departureTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      generateAheadDays: schedule.generateAheadDays,
    });
    if (occurrences.length === 0) {
      return { ridesCreated: 0, autoBookingsCreated: 0 };
    }
    const existingRides =
      await this._rideRepository.findUpcomingByRecurringRideId(schedule.id);
    const existingDates = new Set(
      existingRides
        .map((r) => r.occurrenceDate)
        .filter((d): d is string => Boolean(d)),
    );

    let ridesCreated = 0;
    let autoBookingsCreated = 0;
    let latestDate: Date | null = null;

    for (const occ of occurrences) {
      if (existingDates.has(occ.occurrenceDate)) {
        continue;
      }
      try {
        const createdRide = await this._rideRepository.create({
          driverId: schedule.driverId,
          vehicleId: schedule.vehicleId,
          recurringRideId: schedule.id,
          occurrenceDate: occ.occurrenceDate,
          origin: schedule.origin,
          destination: schedule.destination,
          stops: schedule.stops,
          departureTime: occ.departureTime,
          totalSeats: schedule.totalSeats,
          availableSeats: schedule.totalSeats,
          pricePerSeat: schedule.pricePerSeat,
          preferences: schedule.preferences,
          pickupInstructions: schedule.pickupInstructions ?? '',
          status: RideStatus.SCHEDULED,
        });

        ridesCreated++;
        latestDate = occ.departureTime;

        autoBookingsCreated += await this._autoBookApprovedPassengers(
          schedule,
          createdRide.id,
          occ.dayOfWeek,
          occ.departureTime,
          vehicle,
        );
      } catch (error: any) {
        if (error?.code === 11000) {
          continue;
        }
        throw error;
      }
    }
    if (latestDate) {
      await this._recurringRideRepository.updateLastGeneratedDate(
        schedule.id,
        latestDate,
      );
    }

    return { ridesCreated, autoBookingsCreated };
  }

  private async _autoBookApprovedPassengers(
    schedule: RecurringRideEntity,
    rideId: string,
    dayOfWeek: number,
    departureTime: Date,
    vehicle: {
      brand: string;
      model: string;
      year: number;
      color: string;
      registrationNumber: string;
      vehiclePhoto?: string;
    },
  ): Promise<number> {
    const approvedSubs =
      await this._subscriptionRepository.findApprovedByRecurringRideAndDay(
        schedule.id,
        dayOfWeek,
      );

    if (approvedSubs.length === 0) return 0;

    const seatFare = Money.create(schedule.pricePerSeat);
    let createdCount = 0;

    for (const sub of approvedSubs) {
      const reserved = await this._rideRepository.reserveSeats(
        rideId,
        sub.seatsRequested,
      );

      if (!reserved) {
        this._logger.warn(
          `Skipped auto-booking for passenger ${sub.passengerId} on ride ${rideId}: insufficient seats.`,
        );
        continue;
      }

      try {
        const totalFare = seatFare.multiply(sub.seatsRequested);

        await this._bookingRepository.create({
          rideId,
          passengerId: sub.passengerId,
          driverId: schedule.driverId,
          seatsRequested: sub.seatsRequested,
          pricePerSeat: seatFare.getAmount(),
          totalPrice: totalFare.getAmount(),
          message: sub.message || 'Auto-booked via recurring commute',
          status: BookingStatus.ACCEPTED,
          driverSnapshot: {
            firstName: schedule.driver?.firstName ?? '',
            lastName: schedule.driver?.lastName ?? '',
            profilePhoto: schedule.driver?.profilePhoto ?? '',
          },
          vehicleSnapshot: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            registrationNumber: vehicle.registrationNumber,
            vehiclePhoto: vehicle.vehiclePhoto ?? '',
          },
          rideSnapshot: {
            origin: schedule.origin,
            destination: schedule.destination,
            stops: schedule.stops,
            departureTime,
            pickupInstructions: schedule.pickupInstructions ?? '',
          },
        });

        createdCount++;
      } catch (error) {
        await this._rideRepository.releaseSeats(rideId, sub.seatsRequested);
        this._logger.error(
          `Failed auto-booking passenger ${sub.passengerId} on ride ${rideId}; seats released.`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return createdCount;
  }
}
