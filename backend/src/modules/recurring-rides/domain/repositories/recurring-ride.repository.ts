import type { RecurringRideEntity } from '../entities/recurring-ride.entity';
import type { RecurringRideStatus } from '../enums/recurring-ride.enums';

export const RECURRING_RIDE_REPOSITORY = Symbol('RECURRING_RIDE_REPOSITORY');

export type CreateRecurringRideData = Omit<
  RecurringRideEntity,
  'id' | 'driver' | 'vehicle' | 'createdAt' | 'updatedAt'
>;

export type UpdateRecurringRideData = Partial<
  Pick<
    RecurringRideEntity,
    | 'origin'
    | 'destination'
    | 'stops'
    | 'daysOfWeek'
    | 'departureTime'
    | 'startDate'
    | 'endDate'
    | 'totalSeats'
    | 'pricePerSeat'
    | 'preferences'
    | 'pickupInstructions'
    | 'generateAheadDays'
  >
>;

export interface ListRecurringRidesQuery {
  page: number;
  limit: number;
  status?: RecurringRideStatus;
  search?: string;
}

export interface IRecurringRideRepository {
  create(data: CreateRecurringRideData): Promise<RecurringRideEntity>;
  findById(id: string): Promise<RecurringRideEntity | null>;
  findByDriverId(
    driverId: string,
    query: ListRecurringRidesQuery,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }>;
  findAll(
    query: ListRecurringRidesQuery,
  ): Promise<{ schedules: RecurringRideEntity[]; total: number }>;
  findActiveForGeneration(referenceDate: Date): Promise<RecurringRideEntity[]>;
  update(
    id: string,
    driverId: string,
    data: UpdateRecurringRideData,
  ): Promise<RecurringRideEntity | null>;
  updateStatus(
    id: string,
    driverId: string,
    status: RecurringRideStatus,
  ): Promise<RecurringRideEntity | null>;
  updateStatusByAdmin(
    id: string,
    status: RecurringRideStatus,
  ): Promise<RecurringRideEntity | null>;
  updateLastGeneratedDate(id: string, date: Date): Promise<void>;
}
