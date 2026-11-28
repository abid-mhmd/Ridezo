import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { ListRecurringRidesQueryDto } from '../dto/list-recurring-rides-query.dto';

export const LIST_MY_RECURRING_RIDES_USE_CASE = Symbol(
  'LIST_MY_RECURRING_RIDES_USE_CASE',
);

export interface IListMyRecurringRidesUseCase {
  execute(
    driverId: string,
    query: ListRecurringRidesQueryDto,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }>;
}
