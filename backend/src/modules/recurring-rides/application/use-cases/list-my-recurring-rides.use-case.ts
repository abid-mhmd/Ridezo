import { Inject, Injectable } from '@nestjs/common';
import {
  RECURRING_RIDE_REPOSITORY,
  type IRecurringRideRepository,
} from '../../domain/repositories/recurring-ride.repository';
import type { ListRecurringRidesQueryDto } from '../dto/list-recurring-rides-query.dto';
import type { IListMyRecurringRidesUseCase } from '../interfaces/list-recurring-rides.use-case.interface';
import { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';

@Injectable()
export class ListMyRecurringRidesUseCase implements IListMyRecurringRidesUseCase {
  constructor(
    @Inject(RECURRING_RIDE_REPOSITORY)
    private readonly _recurringRideRepository: IRecurringRideRepository,
  ) {}
  async execute(
    driverId: string,
    query: ListRecurringRidesQueryDto,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }> {
    return this._recurringRideRepository.findByDriverId(driverId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      status: query.status,
      search: query.search,
    });
  }
}
