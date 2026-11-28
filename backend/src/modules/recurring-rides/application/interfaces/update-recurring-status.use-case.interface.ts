import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { UpdateRecurringStatusDto } from '../dto/update-recurring-status.dto';

export const UPDATE_RECURRING_STATUS_USE_CASE = Symbol(
  'UPDATE_RECURRING_STATUS_USE_CASE',
);

export interface IUpdateRecurringStatusUseCase {
  execute(
    scheduleId: string,
    driverId: string,
    dto: UpdateRecurringStatusDto,
  ): Promise<RecurringRideEntity>;
}
