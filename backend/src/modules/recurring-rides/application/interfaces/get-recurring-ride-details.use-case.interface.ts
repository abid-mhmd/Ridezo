import type { RideEntity } from '../../../rides/domain/entities/ride.entity';
import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';

export const GET_RECURRING_RIDE_DETAILS_USE_CASE = Symbol(
  'GET_RECURRING_RIDE_DETAILS_USE_CASE',
);

export interface RecurringRideDetailsResult {
  schedule: RecurringRideEntity;
  upcomingRides: RideEntity[];
  subscriptions: RecurringSubscriptionEntity[];
}

export interface IGetRecurringRideDetailsUseCase {
  execute(
    scheduleId: string,
    requesterId: string,
    isAdmin?: boolean,
  ): Promise<RecurringRideDetailsResult>;
}
