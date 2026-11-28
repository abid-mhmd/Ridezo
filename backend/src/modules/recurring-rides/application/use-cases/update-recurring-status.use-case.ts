import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import { RecurringRideStatus } from '../../domain/enums/recurring-ride.enums';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import type { UpdateRecurringStatusDto } from '../dto/update-recurring-status.dto';
import {
  GENERATE_UPCOMING_RIDES_USE_CASE,
  type IGenerateUpcomingRidesUseCase,
} from '../interfaces/generate-upcoming-rides.use-case.interface';
import type { IUpdateRecurringStatusUseCase } from '../interfaces/update-recurring-status.use-case.interface';
import { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';

@Injectable()
export class UpdateRecurringStatusUseCase implements IUpdateRecurringStatusUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
    @Inject(RIDE_REPOSITORY)
    private readonly _rideRepository: IRideRepository,
    @Inject(GENERATE_UPCOMING_RIDES_USE_CASE)
    private readonly _generateUpcomingRidesUseCase: IGenerateUpcomingRidesUseCase,
  ) {}
  async execute(
    scheduleId: string,
    driverId: string,
    dto: UpdateRecurringStatusDto,
  ): Promise<RecurringRideEntity> {
    const existing = await this._recurringRideRepository.findById(scheduleId);
    if (!existing || existing.driverId !== driverId) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }
    if (existing.status === RecurringRideStatus.CANCELLED) {
      throw new BadRequestException('Cancelled schedules cannot be changed.');
    }

    const updated = await this._recurringRideRepository.updateStatus(
      scheduleId,
      driverId,
      dto.status,
    );
    if (!updated) {
      throw new NotFoundException('Recurring ride schedule not found.');
    }

    if (dto.status === RecurringRideStatus.ACTIVE) {
      await this._generateUpcomingRidesUseCase.generateForSchedule(updated);
    }
    if (dto.status === RecurringRideStatus.CANCELLED && dto.cancelFutureRides) {
      await this._rideRepository.cancelFutureByRecurringRideId(updated.id);
    }
    return updated;
  }
}
