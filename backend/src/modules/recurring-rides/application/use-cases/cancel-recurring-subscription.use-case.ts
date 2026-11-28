import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RecurringSubscriptionStatus } from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_SUBSCRIPTION_REPOSITORY,
  type IRecurringSubscriptionRepository,
} from '../../domain/repositories/recurring-subscription.repository';
import type { ICancelRecurringSubscriptionUseCase } from '../interfaces/cancel-recurring-subscription.use-case';

@Injectable()
export class CancelRecurringSubscriptionUseCase implements ICancelRecurringSubscriptionUseCase {
  constructor(
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
  ) {}

  async execute(subscriptionId: string, requesterId: string) {
    const subscription =
      await this._subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Recurring subscription not found.');
    }

    const isAllowed =
      subscription.passengerId === requesterId ||
      subscription.driverId === requesterId;
    if (!isAllowed) {
      throw new ForbiddenException(
        'You are not allowed to cancel this recurring subscription.',
      );
    }

    if (
      subscription.status === RecurringSubscriptionStatus.CANCELLED ||
      subscription.status === RecurringSubscriptionStatus.REJECTED
    ) {
      throw new BadRequestException('This subscription is already inactive.');
    }

    const updated = await this._subscriptionRepository.updateStatus(
      subscriptionId,
      RecurringSubscriptionStatus.CANCELLED,
    );

    if (!updated) {
      throw new NotFoundException('Recurring subscription not found.');
    }

    return updated;
  }
}
