import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';
import type { CreateRecurringRideDto } from '../dto/create-recurring-ride.dto';

export const CREATE_RECURRING_RIDE_USE_CASE = Symbol(
  'CREATE_RECURRING_RIDE_USE_CASE',
);

export interface ICreateRecurringRideUseCase {
  execute(
    driverId: string,
    dto: CreateRecurringRideDto,
  ): Promise<{ schedule: RecurringRideEntity; generatedCount: number }>;
}
