import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RecurringRideStatus,
  RecurringSubscriptionStatus,
} from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import {
  RECURRING_SUBSCRIPTION_REPOSITORY,
  type IRecurringSubscriptionRepository,
} from '../../domain/repositories/recurring-subscription.repository';
import type { CreateRecurringSubscriptionDto } from '../dto/create-recurrring-subscription.dto';
import type { IRequestRecurringSubscriptionUseCase } from '../interfaces/request-recurring-subscription.use-case.interface';
import { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';

@Injectable()
export class RequestRecurringSubscriptionUseCase implements IRequestRecurringSubscriptionUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
  ) {}
  async execute(
    scheduleId: string,
    passengerId: string,
    dto: CreateRecurringSubscriptionDto,
  ): Promise<RecurringSubscriptionEntity> {
    const schedule = await this._recurringRideRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    if (schedule.status !== RecurringRideStatus.ACTIVE) {
      throw new BadRequestException('This recurring schedule is not active.');
    }
    if (schedule.driverId === passengerId) {
      throw new BadRequestException(
        'You cannot subscribe to your own recurring ride.',
      );
    }
    if (dto.seatsRequested > schedule.totalSeats) {
      throw new BadRequestException(
        `Cannot request more than ${schedule.totalSeats} seat(s).`,
      );
    }
    const scheduleDaySet = new Set(schedule.daysOfWeek);
    const uniqueDays = [...new Set(dto.daysOfWeek)].sort((a, b) => a - b);
    const hasInvalidDay = uniqueDays.some((day) => !scheduleDaySet.has(day));
    if (hasInvalidDay) {
      throw new BadRequestException(
        'Requested days must be within the driver’s operating days.',
      );
    }

    const existing =
      await this._subscriptionRepository.findActiveByPassengerAndSchedule(
        passengerId,
        scheduleId,
      );
    if (existing) {
      throw new ConflictException(
        'You already have an active or pending recurring request for this schedule.',
      );
    }

    return this._subscriptionRepository.create({
      recurringRideId: schedule.id,
      passengerId,
      driverId: schedule.driverId,
      seatsRequested: dto.seatsRequested,
      daysOfWeek: uniqueDays,
      message: dto.message?.trim() ?? '',
      status: RecurringSubscriptionStatus.PENDING,
    });
  }
}
