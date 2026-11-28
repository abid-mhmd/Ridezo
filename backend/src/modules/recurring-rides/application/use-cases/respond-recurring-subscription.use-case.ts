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
import type { RespondRecurringSubscriptionDto } from '../dto/respond-recurring-subscription.dto';
import type { IRespondRecurringSubscriptionUseCase } from '../interfaces/respond-recurring-subscription.use-case.interface';
import { RecurringSubscriptionEntity } from '../../domain/entities/recurring-subscription.entity';

@Injectable()
export class RespondRecurringSubscriptionUseCase implements IRespondRecurringSubscriptionUseCase {
  constructor(
    @Inject(RECURRING_SUBSCRIPTION_REPOSITORY)
    private readonly _subscriptionRepository: IRecurringSubscriptionRepository,
  ) {}
  async execute(
    subscriptionId: string,
    driverId: string,
    dto: RespondRecurringSubscriptionDto,
  ): Promise<RecurringSubscriptionEntity> {
    const subscription =
      await this._subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Recurring subscription request not found.');
    }
    if (subscription.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the schedule owner can respond to this request.',
      );
    }
    if (subscription.status !== RecurringSubscriptionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending subscription requests can be updated.',
      );
    }
    const updated = await this._subscriptionRepository.updateStatus(
      subscriptionId,
      dto.status,
      dto.rejectionReason?.trim(),
    );
    if (!updated) {
      throw new NotFoundException('Recurring subscription request not found.');
    }
    return updated;
  }
}
