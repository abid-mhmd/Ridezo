export type BookingStatus =
  'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface BookingLocationSnapshot {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface BookingDriverSnapshot {
  firstName: string;
  lastName: string;
  profilePhoto: string;
  phone?: string;
}

export interface BookingVehicleSnapshot {
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
}

export interface BookingRideSnapshot {
  origin: BookingLocationSnapshot;
  destination: BookingLocationSnapshot;
  stops: BookingLocationSnapshot[];
  departureTime: string;
  pickupInstructions?: string;
}
export interface BookingPassengerSnapshot {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface Booking {
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

  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  rideId: string;
  seatsRequested: number;
  message?: string;
}

export interface MyBookingsResult {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
