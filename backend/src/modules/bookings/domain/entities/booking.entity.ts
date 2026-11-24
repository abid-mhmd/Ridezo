import { BookingStatus } from '../enums/booking.enums';

export interface BookingDriverSnapshot {
  firstName: string;
  lastName: string;
  profilePhoto: string;
  phone?: string;
}

export interface BookingPassengerSnapshot {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface BookingVehicleSnapshot {
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
}
export interface BookingLocationSnapshot {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface BookingRideSnapshot {
  origin: BookingLocationSnapshot;
  destination: BookingLocationSnapshot;
  stops: BookingLocationSnapshot[];
  departureTime: Date;
  pickupInstructions?: string;
}

export interface BookingEntity {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  seatsRequested: number;
  pricePerSeat: number;
  totalPrice: number;
  passengerSnapshot?: BookingPassengerSnapshot;
  driverSnapshot: BookingDriverSnapshot;
  vehicleSnapshot: BookingVehicleSnapshot;
  rideSnapshot: BookingRideSnapshot;
  message?: string;
  rejectionReason?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
