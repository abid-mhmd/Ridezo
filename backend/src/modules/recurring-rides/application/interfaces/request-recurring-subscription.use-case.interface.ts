import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';
import type { CreateRecurringSubscriptionDto } from '../dto/create-recurrring-subscription.dto';

export const REQUEST_RECURRING_SUBSCRIPTION_USE_CASE = Symbol(
  'REQUEST_RECURRING_SUBSCRIPTION_USE_CASE',
);

export interface IRequestRecurringSubscriptionUseCase {
  execute(
    scheduleId: string,
    passengerId: string,
    dto: CreateRecurringSubscriptionDto,
  ): Promise<RecurringSubscriptionEntity>;
}
