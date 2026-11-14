export interface ICancelRideUseCase {
  execute(driverId: string, rideId: string): Promise<void>;
}
