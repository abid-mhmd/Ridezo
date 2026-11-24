import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CarFront,
  CreditCard,
  ShieldCheck,
  UserRound,
  Phone,
} from 'lucide-react';

import type { Booking, BookingStatus } from '../types/booking-types';

interface MyBookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  isCancelling?: boolean;
}

function formatDepartureTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBookingStatusStyle(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400';

    case 'accepted':
      return 'border-[#36e0c0]/20 bg-[#36e0c0]/10 text-[#36e0c0]';

    case 'rejected':
      return 'border-red-500/20 bg-red-500/10 text-red-400';

    case 'cancelled':
      return 'border-gray-500/20 bg-gray-500/10 text-gray-400';

    case 'completed':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-400';

    default:
      return 'border-gray-500/20 bg-gray-500/10 text-gray-400';
  }
}

function formatDriverName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName]
    .map((part) =>
      part && part.toLowerCase() !== 'undefined' ? part.trim() : '',
    )
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : 'Driver information unavailable';
}

export default function MyBookingCard({
  booking,
  onCancel,
  isCancelling = false,
}: MyBookingCardProps) {
  const navigate = useNavigate();

  const driverName = formatDriverName(
    booking.driverSnapshot?.firstName,
    booking.driverSnapshot?.lastName,
  );

  const vehicleName = [
    booking.vehicleSnapshot?.brand,
    booking.vehicleSnapshot?.model,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] shadow-xl transition duration-200 hover:border-[#36e0c0]/40">
      <div className="space-y-4 p-4 sm:p-5">
        {/* Role & Booking Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#36e0c0]">
              🚗 YOU&apos;RE RIDING
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getBookingStatusStyle(booking.status)}`}
            >
              {booking.status}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[#929bad]">
            REF: #BKG-{booking.id.slice(0, 5).toUpperCase()}
          </span>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#36e0c0] bg-[#080b12]" />
                <span className="my-1 h-10 w-0.5 bg-[#252e3e]" />
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#8b78ff] bg-[#080b12]" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-white">
                    {formatDepartureTime(booking.rideSnapshot.departureTime)}
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    {booking.rideSnapshot.origin.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Destination Drop
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    {booking.rideSnapshot.destination.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {booking.driverSnapshot?.profilePhoto ? (
                    <img
                      src={booking.driverSnapshot.profilePhoto}
                      alt={driverName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8b78ff]/15 text-[#b6a8ff]">
                      <UserRound size={20} />
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] text-[#929bad]">Your Driver</p>
                    <p className="text-xs font-bold text-white">{driverName}</p>
                  </div>
                </div>

                {booking.driverSnapshot?.phone && (
                  <a
                    href={`tel:${booking.driverSnapshot.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
                  >
                    <Phone size={12} />
                    {booking.driverSnapshot.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="flex items-center gap-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
              {booking.vehicleSnapshot?.vehiclePhoto ? (
                <img
                  src={booking.vehicleSnapshot.vehiclePhoto}
                  alt={vehicleName || 'Vehicle'}
                  className="h-12 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-[#8b78ff]/15 text-[#b6a8ff]">
                  <CarFront size={22} />
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-white">
                  {vehicleName || 'Vehicle information unavailable'}
                </p>
                <p className="text-[10px] text-[#929bad]">
                  {booking.vehicleSnapshot?.year} ·{' '}
                  {booking.vehicleSnapshot?.color}
                </p>
                <p className="text-[10px] text-[#929bad]">
                  {booking.vehicleSnapshot?.registrationNumber}
                </p>
              </div>
            </div>

            {/* Booking Status Information */}
            <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
              <p className="text-xs font-bold text-white">
                Booking Information
              </p>
              <p className="mt-1 text-[10px] text-[#929bad]">
                {booking.status === 'pending' &&
                  'Your booking request is waiting for driver approval.'}
                {booking.status === 'accepted' &&
                  'Your booking request has been accepted. Complete payment to finalize.'}
                {booking.status === 'rejected' &&
                  'Your booking request was rejected by the driver.'}
                {booking.status === 'cancelled' &&
                  'This booking has been cancelled.'}
                {booking.status === 'completed' &&
                  'This journey has been completed.'}
              </p>

              {booking.rejectionReason && booking.status === 'rejected' && (
                <p className="mt-2 text-[10px] text-red-400">
                  Reason: {booking.rejectionReason}
                </p>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4 text-xs lg:col-span-4">
            <div className="flex items-center gap-2 border-b border-[#252e3e] pb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#36e0c0]/15 text-[#36e0c0]">
                <CalendarDays size={15} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-white">
                  Booking Summary
                </p>
                <p className="text-[9px] text-[#929bad]">
                  Your reserved journey
                </p>
              </div>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Seats Requested</span>
              <span className="font-medium text-white">
                {booking.seatsRequested}
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Price Per Seat</span>
              <span className="font-medium text-white">
                ₹{booking.pricePerSeat}
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Booking Status</span>
              <span className="font-semibold capitalize text-white">
                {booking.status}
              </span>
            </div>

            <div className="border-t border-[#252e3e] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[#929bad]">Total Amount</span>
                <span className="text-lg font-bold text-[#36e0c0]">
                  ₹{booking.totalPrice}
                </span>
              </div>
            </div>

            {booking.status === 'accepted' && (
              <button
                type="button"
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#36e0c0] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#2bc2a1]"
              >
                <CreditCard size={13} />
                Proceed to Payment
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-[10px] text-[#36e0c0]">
            <ShieldCheck size={13} />
            Booking Information
          </span>

          <div className="flex items-center gap-2">
            {(booking.status === 'pending' || booking.status === 'accepted') &&
              onCancel && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => onCancel(booking.id)}
                  className="cursor-pointer rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {isCancelling
                    ? 'Cancelling...'
                    : booking.status === 'pending'
                      ? 'Cancel Request'
                      : 'Cancel Booking'}
                </button>
              )}

            <button
              type="button"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className="cursor-pointer rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
            >
              View Booking Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
