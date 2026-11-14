import type { RideEntity } from '../entities/ride.entity';

export const RIDE_REPOSITORY = Symbol('RIDE_REPOSITORY');

export type CreateRideData = Omit<RideEntity, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateRideData = Partial<
  Pick<
    RideEntity,
    | 'origin'
    | 'destination'
    | 'stops'
    | 'departureTime'
    | 'pricePerSeat'
    | 'preferences'
    | 'pickupInstructions'
  >
>;

export interface ListRidesQuery {
  page: number;
  limit: number;
}

export interface IRideRepository {
  create(data: CreateRideData): Promise<RideEntity>;

  findById(rideId: string): Promise<RideEntity | null>;

  findByDriverId(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;

  update(
    rideId: string,
    driverId: string,
    data: UpdateRideData,
  ): Promise<RideEntity | null>;

  cancel(rideId: string, driverId: string): Promise<boolean>;
}
