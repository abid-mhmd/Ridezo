export const BOOKING_ENDPOINTS = {
  ROOT: 'bookings',
  MY_BOOKINGS: 'bookings/my-bookings',
  BOOKING_REQUESTS: 'bookings/requests',
  BY_ID: 'bookings/:bookingId',
  ACCEPT: 'bookings/:bookingId/accept',
  REJECT: 'bookings/:bookingId/reject',
  CANCEL: 'bookings/:bookingId/cancel',
  RESPOND: 'bookings/:bookingId/respond',
} as const;
