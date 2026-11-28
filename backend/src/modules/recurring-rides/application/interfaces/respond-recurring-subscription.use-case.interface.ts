import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';
import type { RespondRecurringSubscriptionDto } from '../dto/respond-recurring-subscription.dto';

export const RESPOND_RECURRING_SUBSCRIPTION_USE_CASE = Symbol(
  'RESPOND_RECURRING_SUBSCRIPTION_USE_CASE',
);

export interface IRespondRecurringSubscriptionUseCase {
  execute(
    subscriptionId: string,
    driverId: string,
    dto: RespondRecurringSubscriptionDto,
  ): Promise<RecurringSubscriptionEntity>;
}
