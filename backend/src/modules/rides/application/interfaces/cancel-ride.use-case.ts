export const CANCEL_RIDE_USE_CASE = Symbol('CANCEL_RIDE_USE_CASE');

export interface ICancelRideUseCase {
  execute(driverId: string, rideId: string): Promise<void>;
}
