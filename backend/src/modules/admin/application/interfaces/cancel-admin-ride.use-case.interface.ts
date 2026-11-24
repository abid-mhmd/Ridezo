import type { RideStatus } from '../../../rides/domain/enums/ride.enums';

export const CANCEL_ADMIN_RIDE_USE_CASE = Symbol('CANCEL_ADMIN_RIDE_USE_CASE');

export interface CancelAdminRideResult {
  id: string;
  status: RideStatus;
}

export interface ICancelAdminRideUseCase {
  execute(rideId: string): Promise<CancelAdminRideResult>;
}
