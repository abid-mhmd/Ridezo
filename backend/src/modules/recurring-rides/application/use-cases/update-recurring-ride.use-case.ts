import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Money } from '../../../../common/domain/value-objects/money.vo';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import { RecurringRideStatus } from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import type { UpdateRecurringRideDto } from '../dto/update-recurring-ride.dto';
import {
  GENERATE_UPCOMING_RIDES_USE_CASE,
  type IGenerateUpcomingRidesUseCase,
} from '../interfaces/generate-upcoming-rides.use-case.interface';
import type { IUpdateRecurringRideUseCase } from '../interfaces/update-recurring-ride.use-case.interface';
import { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';

@Injectable()
export class UpdateRecurringRideUseCase implements IUpdateRecurringRideUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RIDE_REPOSITORY)
    private readonly _rideRepository: IRideRepository,
    @Inject(GENERATE_UPCOMING_RIDES_USE_CASE)
    private readonly _generateUpcomingRidesUseCase: IGenerateUpcomingRidesUseCase,
  ) {}
  async execute(
    scheduleId: string,
    driverId: string,
    dto: UpdateRecurringRideDto,
  ): Promise<RecurringRideEntity> {
    const existing = await this._recurringRideRepository.findById(scheduleId);
    if (!existing || existing.driverId !== driverId) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    if (existing.status === RecurringRideStatus.CANCELLED) {
      throw new BadRequestException('Cancelled schedules cannot be edited.');
    }

    const pricePerSeat =
      dto.pricePerSeat !== undefined
        ? Money.create(dto.pricePerSeat).getAmount()
        : undefined;
    const updated = await this._recurringRideRepository.update(
      scheduleId,
      driverId,
      {
        ...(dto.origin && { origin: dto.origin }),
        ...(dto.destination && { destination: dto.destination }),
        ...(dto.stops && { stops: dto.stops }),
        ...(dto.daysOfWeek && {
          daysOfWeek: [...new Set(dto.daysOfWeek)].sort((a, b) => a - b),
        }),
        ...(dto.departureTime && { departureTime: dto.departureTime }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.totalSeats !== undefined && { totalSeats: dto.totalSeats }),
        ...(pricePerSeat !== undefined && { pricePerSeat }),
        ...(dto.preferences && { preferences: dto.preferences }),
        ...(dto.pickupInstructions !== undefined && {
          pickupInstructions: dto.pickupInstructions.trim(),
        }),
      },
    );
    if (!updated) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    const futureRideUpdates: Record<string, unknown> = {};
    if (pricePerSeat !== undefined)
      futureRideUpdates.pricePerSeat = pricePerSeat;
    if (dto.preferences) futureRideUpdates.preferences = dto.preferences;
    if (dto.pickupInstructions !== undefined) {
      futureRideUpdates.pickupInstructions = dto.pickupInstructions.trim();
    }

    if (Object.keys(futureRideUpdates).length > 0) {
      await this._rideRepository.updateFutureByRecurringRideId(
        updated.id,
        futureRideUpdates,
      );
    }

    if (updated.status === RecurringRideStatus.ACTIVE) {
      await this._generateUpcomingRidesUseCase.generateForSchedule(updated);
    }

    return updated;
  }
}
