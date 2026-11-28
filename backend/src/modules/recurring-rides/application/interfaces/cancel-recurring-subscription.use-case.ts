import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';

export const CANCEL_RECURRING_SUBSCRIPTION_USE_CASE = Symbol(
  'CANCEL_RECURRING_SUBSCRIPTION_USE_CASE',
);

export interface ICancelRecurringSubscriptionUseCase {
  execute(
    subscriptionId: string,
    requesterId: string,
  ): Promise<RecurringSubscriptionEntity>;
}
