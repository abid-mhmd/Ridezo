import type { RecurringRideEntity } from '../../domain/entities/recurring-ride.entity';

export const GENERATE_UPCOMING_RIDES_USE_CASE = Symbol(
  'GENERATE_UPCOMING_RIDES_USE_CASE',
);

export interface GenerateUpcomingResult {
  schedulesProcessed: number;
  ridesCreated: number;
  autoBookingsCreated: number;
}

export interface IGenerateUpcomingRidesUseCase {
  generateForSchedule(schedule: RecurringRideEntity): Promise<{
    ridesCreated: number;
    autoBookingsCreated: number;
  }>;
  generateAllActive(): Promise<GenerateUpcomingResult>;
}
