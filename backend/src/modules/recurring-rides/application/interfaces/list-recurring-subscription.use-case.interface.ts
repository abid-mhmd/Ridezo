import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';
import type { RecurringSubscriptionStatus } from '../../domain/enums/recurring-ride.enums';

export const LIST_RECURRING_SUBSCRIPTIONS_USE_CASE = Symbol(
  'LIST_RECURRING_SUBSCRIPTIONS_USE_CASE',
);

export interface IListRecurringSubscriptionsUseCase {
  executeForSchedule(
    scheduleId: string,
    driverId: string,
    status?: RecurringSubscriptionStatus,
  ): Promise<RecurringSubscriptionEntity[]>;
  executeForPassenger(
    passengerId: string,
  ): Promise<RecurringSubscriptionEntity[]>;
}
