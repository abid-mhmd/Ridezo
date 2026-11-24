import type { RideEntity } from '../../../rides/domain/entities/ride.entity';

export const GET_ADMIN_RIDE_DETAILS_USE_CASE = Symbol(
  'GET_ADMIN_RIDE_DETAILS_USE_CASE',
);

export interface AdminRideDriverContact {
  email: string;
  phone?: string;
}

export interface AdminRideDetailsResult {
  ride: RideEntity;
  driverContact: AdminRideDriverContact | null;
}

export interface IGetAdminRideDetailsUseCase {
  execute(rideId: string): Promise<AdminRideDetailsResult>;
}
