import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import {
  RECURRING_SUBSCRIPTION_REPOSITORY,
  type IRecurringSubscriptionRepository,
} from '../../domain/repositories/recurring-subscription.repository';
import type {
  IGetRecurringRideDetailsUseCase,
  RecurringRideDetailsResult,
} from '../interfaces/get-recurring-ride-details.use-case.interface';

@Injectable()
export class GetRecurringRideDetailsUseCase implements IGetRecurringRideDetailsUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RIDE_REPOSITORY)
    private readonly _rideRepository: IRideRepository,
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
  ) {}
  async execute(
    scheduleId: string,
    requesterId: string,
    isAdmin?: boolean,
  ): Promise<RecurringRideDetailsResult> {
    const schedule = await this._recurringRideRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    const canViewSubscriptions = isAdmin || schedule.driverId === requesterId;

    const [upcomingRides, subscriptions] = await Promise.all([
      this._rideRepository.findUpcomingByRecurringRideId(scheduleId),
      canViewSubscriptions
        ? this._subscriptionRepository.findByRecurringRideId(scheduleId)
        : Promise.resolve([]),
    ]);

    return { schedule, upcomingRides, subscriptions };
  }
}
