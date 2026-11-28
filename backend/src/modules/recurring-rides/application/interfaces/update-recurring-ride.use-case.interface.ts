import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { UpdateRecurringRideDto } from '../dto/update-recurring-ride.dto';

export const UPDATE_RECURRING_RIDE_USE_CASE = Symbol(
  'UPDATE_RECURRING_RIDE_USE_CASE',
);

export interface IUpdateRecurringRideUseCase {
  execute(
    scheduleId: string,
    driverId: string,
    dto: UpdateRecurringRideDto,
  ): Promise<RecurringRideEntity>;
}
