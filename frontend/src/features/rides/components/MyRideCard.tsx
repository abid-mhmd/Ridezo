import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Users,
} from 'lucide-react';

import type { Ride, RideStatus } from '../types/ride.types';
import type { Booking } from '../../bookings/types/booking-types';

interface MyRideCardProps {
  ride: Ride;
  onCancel: (rideId: string) => void;
  onManageRequests: (rideId: string, tab?: 'pending' | 'accepted') => void;
  isCancelling: boolean;
  pendingBookings: Booking[];
  acceptedBookings: Booking[];
}

function getStatusStyle(status: RideStatus): string {
  switch (status) {
    case 'scheduled':
      return 'border-[#36e0c0]/20 bg-[#36e0c0]/10 text-[#36e0c0]';
    case 'full':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
    case 'started':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
    case 'completed':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-400';
    case 'cancelled':
      return 'border-red-500/20 bg-red-500/10 text-red-400';
    default:
      return 'border-gray-500/20 bg-gray-500/10 text-gray-400';
  }
}

function formatDepartureTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPassengerName(booking: Booking): string {
  const fullName = [
    booking.passengerSnapshot?.firstName,
    booking.passengerSnapshot?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    fullName || `Passenger #${booking.passengerId.slice(-6).toUpperCase()}`
  );
}

export default function MyRideCard({
  ride,
  onCancel,
  onManageRequests,
  isCancelling,
  pendingBookings,
  acceptedBookings,
}: MyRideCardProps) {
  const navigate = useNavigate();

  const isActiveRide = ride.status === 'scheduled' || ride.status === 'full';
  const bookedSeats = ride.totalSeats - ride.availableSeats;
  const pendingCount = pendingBookings.length;
  const acceptedCount = acceptedBookings.length;

  const confirmedSeats = acceptedBookings.reduce(
    (sum, b) => sum + b.seatsRequested,
    0,
  );
  const confirmedFare = acceptedBookings.reduce(
    (sum, b) => sum + b.totalPrice,
    0,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] shadow-xl transition duration-200 hover:border-[#8b78ff]/40">
      <div className="space-y-4 p-4 sm:p-5">
        {/* Role & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#b6a8ff]">
              🚗 YOU&apos;RE DRIVING
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getStatusStyle(ride.status)}`}
            >
              {ride.status}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[#929bad]">
            REF: #TRP-{ride.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Route & Summary */}
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#36e0c0] bg-[#080b12]" />
                <span className="my-1 h-10 w-0.5 bg-[#252e3e]" />
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#8b78ff] bg-[#080b12]" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-white">
                    {formatDepartureTime(ride.departureTime)}
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    {ride.origin.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Destination Drop
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    {ride.destination.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Requests — only shown when pending requests exist */}
            {isActiveRide && pendingCount > 0 && (
              <div className="space-y-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertCircle size={13} />
                    Pending Booking Requests
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                    {pendingCount} Pending
                  </span>
                </div>
                <p className="text-[11px] text-[#c7cddd]">
                  You have {pendingCount} pending seat request
                  {pendingCount === 1 ? '' : 's'} awaiting your approval.
                </p>
              </div>
            )}

            {/* Confirmed Bookings — only shown when accepted bookings exist */}
            {acceptedCount > 0 && (
              <div className="space-y-2.5 rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-bold text-[#36e0c0]">
                    <CheckCircle2 size={14} />
                    Confirmed Bookings ({acceptedCount})
                  </span>
                  <span className="text-[10px] font-semibold text-[#c7cddd]">
                    {confirmedSeats} seat{confirmedSeats === 1 ? '' : 's'} · ₹
                    {confirmedFare.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {acceptedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#252e3e] bg-[#080b12]/80 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <Users size={12} className="text-[#36e0c0]" />
                        <span className="font-semibold text-white">
                          {getPassengerName(booking)}
                        </span>
                        {booking.passengerSnapshot?.phone && (
                          <span className="text-[#36e0c0]">
                            · {booking.passengerSnapshot.phone}
                          </span>
                        )}
                        <span className="text-[#929bad]">
                          · {booking.seatsRequested} seat
                          {booking.seatsRequested === 1 ? '' : 's'} · ₹
                          {booking.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/bookings/${booking.id}?role=driver`)
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#36e0c0]/30 bg-[#36e0c0]/15 px-2.5 py-1 text-[10px] font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/25"
                      >
                        <Eye size={11} />
                        View Booking
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="space-y-2.5 rounded-xl border border-[#252e3e] bg-[#080b12] p-4 text-xs lg:col-span-4">
            <div className="flex items-center gap-2 border-b border-[#252e3e] pb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b78ff]/15 text-[#8b78ff]">
                🚗
              </div>
              <div>
                <p className="text-[10px] font-bold text-white">
                  {ride.vehicle
                    ? `${ride.vehicle.brand} ${ride.vehicle.model}`
                    : 'Ride Summary'}
                </p>
                <p className="font-mono text-[9px] text-[#929bad]">
                  {ride.vehicle?.registrationNumber || 'Your offered ride'}
                </p>
              </div>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Capacity Booked</span>
              <span className="font-medium text-white">
                {bookedSeats} of {ride.totalSeats} Seats
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Available Seats</span>
              <span className="font-medium text-white">
                {ride.availableSeats}
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Rate / Seat</span>
              <span className="font-bold text-[#36e0c0]">
                ₹{ride.pricePerSeat}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-[10px] text-[#36e0c0]">
            <ShieldCheck size={13} />
            Host Controls
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {isActiveRide && pendingCount > 0 && (
              <button
                type="button"
                onClick={() => onManageRequests(ride.id, 'pending')}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Manage Requests ({pendingCount})
              </button>
            )}

            {acceptedCount > 0 && (
              <button
                type="button"
                onClick={() => onManageRequests(ride.id, 'accepted')}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  pendingCount === 0
                    ? 'bg-[#36e0c0] text-black shadow-md hover:bg-[#2bc2a1]'
                    : 'border border-[#36e0c0]/30 bg-[#36e0c0]/10 text-[#36e0c0] hover:bg-[#36e0c0]/20'
                }`}
              >
                View Bookings ({acceptedCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/rides/${ride.id}/host`)}
              className="cursor-pointer rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
            >
              Ride Details
            </button>

            {ride.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => navigate(`/rides/${ride.id}/edit`)}
                className="cursor-pointer rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
              >
                Edit Ride
              </button>
            )}

            {isActiveRide && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => onCancel(ride.id)}
                className="cursor-pointer rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
