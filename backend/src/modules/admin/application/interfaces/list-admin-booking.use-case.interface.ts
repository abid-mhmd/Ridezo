import type { BookingEntity } from '../../../bookings/domain/entities/booking.entity';
import type { AdminBookingListQueryDto } from '../dto/admin-booking-query.dto';

export const LIST_ADMIN_BOOKINGS_USE_CASE = Symbol(
  'LIST_ADMIN_BOOKINGS_USE_CASE',
);

export interface AdminBookingPassenger {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profilePhoto: string;
}

export interface AdminBookingListItem {
  booking: BookingEntity;
  passenger: AdminBookingPassenger | null;
}

export interface ListAdminBookingsResult {
  bookings: AdminBookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IListAdminBookingsUseCase {
  execute(query: AdminBookingListQueryDto): Promise<ListAdminBookingsResult>;
}
