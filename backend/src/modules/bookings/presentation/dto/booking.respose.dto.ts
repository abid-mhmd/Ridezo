import type { BookingStatus } from '../../domain/enums/booking.enums';

export interface BookingLocationDto {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface BookingDriverSnapshotDto {
  firstName: string;
  lastName: string;
  profilePhoto: string;
}

export interface BookingVehicleSnapshotDto {
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
}

export interface BookingRideSnapshotDto {
  origin: BookingLocationDto;
  destination: BookingLocationDto;
  stops: BookingLocationDto[];
  departureTime: Date;
  pickupInstructions?: string;
}

export class BookingResponseDto {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;

  seatsRequested: number;
  pricePerSeat: number;
  totalPrice: number;

  driverSnapshot: BookingDriverSnapshotDto;
  vehicleSnapshot: BookingVehicleSnapshotDto;
  rideSnapshot: BookingRideSnapshotDto;

  message?: string;
  rejectionReason?: string;
  status: BookingStatus;

  createdAt: Date;
  updatedAt: Date;
}
