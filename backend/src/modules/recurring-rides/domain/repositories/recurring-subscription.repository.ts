import type { RecurringSubscriptionEntity } from '../entities/recurring-subscription.entity';
import type { RecurringSubscriptionStatus } from '../enums/recurring-ride.enums';

export const RECURRING_SUBSCRIPTION_REPOSITORY = Symbol(
  'RECURRING_SUBSCRIPTION_REPOSITORY',
);

export type CreateRecurringSubscriptionData = Omit<
  RecurringSubscriptionEntity,
  'id' | 'passenger' | 'createdAt' | 'updatedAt'
>;

export interface IRecurringSubscriptionRepository {
  create(
    data: CreateRecurringSubscriptionData,
  ): Promise<RecurringSubscriptionEntity>;
  findById(id: string): Promise<RecurringSubscriptionEntity | null>;
  findActiveByPassengerAndSchedule(
    passengerId: string,
    recurringRideId: string,
  ): Promise<RecurringSubscriptionEntity | null>;
  findByRecurringRideId(
    recurringRideId: string,
    status?: RecurringSubscriptionStatus,
  ): Promise<RecurringSubscriptionEntity[]>;
  findApprovedByRecurringRideAndDay(
    recurringRideId: string,
    dayOfWeek: number,
  ): Promise<RecurringSubscriptionEntity[]>;
  findByPassengerId(
    passengerId: string,
  ): Promise<RecurringSubscriptionEntity[]>;
  updateStatus(
    id: string,
    status: RecurringSubscriptionStatus,
    rejectionReason?: string,
  ): Promise<RecurringSubscriptionEntity | null>;
}
