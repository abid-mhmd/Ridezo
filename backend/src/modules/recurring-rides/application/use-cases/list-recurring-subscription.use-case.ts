import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RecurringSubscriptionStatus } from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import {
  RECURRING_SUBSCRIPTION_REPOSITORY,
  type IRecurringSubscriptionRepository,
} from '../../domain/repositories/recurring-subscription.repository';
import type { IListRecurringSubscriptionsUseCase } from '../interfaces/list-recurring-subscription.use-case.interface';
import { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';

@Injectable()
export class ListRecurringSubscriptionsUseCase implements IListRecurringSubscriptionsUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
  ) {}
  async executeForSchedule(
    scheduleId: string,
    driverId: string,
    status?: RecurringSubscriptionStatus,
  ): Promise<RecurringSubscriptionEntity[]> {
    const schedule = await this._recurringRideRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    if (schedule.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the schedule owner can view its subscribers.',
      );
    }
    return this._subscriptionRepository.findByRecurringRideId(
      scheduleId,
      status,
    );
  }

  async executeForPassenger(
    passengerId: string,
  ): Promise<RecurringSubscriptionEntity[]> {
    return this._subscriptionRepository.findByPassengerId(passengerId);
  }
}
