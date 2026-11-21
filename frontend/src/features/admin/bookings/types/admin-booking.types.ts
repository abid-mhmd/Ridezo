export type BookingStatus =
  'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface AdminBookingPassenger {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto: string;
}

export interface AdminBookingDriver {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePhoto: string;
}

export interface AdminBookingVehicle {
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  vehiclePhoto: string;
}

export interface AdminBookingLocation {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface AdminBookingListItem {
  id: string;
  rideId: string;
  passenger: AdminBookingPassenger | null;
  driver: AdminBookingDriver;
  vehicle: AdminBookingVehicle;
  ride: {
    origin: AdminBookingLocation;
    destination: AdminBookingLocation;
    departureTime: string;
  };
  seatsRequested: number;
  pricePerSeat: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingListResponse {
  bookings: AdminBookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminBookingListParams {
  page: number;
  limit: number;
  search?:string;
}
