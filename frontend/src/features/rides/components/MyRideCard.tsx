import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck } from 'lucide-react';

import type { Ride, RideStatus } from '../types/ride.types';

interface MyRideCardProps {
  ride: Ride;
  onCancel: (rideId: string) => void;
  onManageRequests: (rideId: string) => void;
  isCancelling: boolean;
  pendingRequestCount: number;
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

export default function MyRideCard({
  ride,
  onCancel,
  onManageRequests,
  isCancelling,
  pendingRequestCount,
}: MyRideCardProps) {
  const navigate = useNavigate();

  const canCancel = ride.status === 'scheduled' || ride.status === 'full';

  const bookedSeats = ride.totalSeats - ride.availableSeats;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] transition duration-200 hover:border-[#8b78ff]/40 shadow-xl">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Role & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 border-purple-500/30 text-[#b6a8ff]">
              🚗 YOU'RE DRIVING
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getStatusStyle(ride.status)}`}
            >
              {ride.status}
            </span>

            {ride.status === 'started' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#36e0c0]/10 px-2 py-0.5 text-[9px] font-bold text-[#36e0c0] animate-pulse">
                ● LIVE NOW
              </span>
            )}
          </div>

          <span className="text-[10px] text-[#929bad] font-mono">
            REF: #TRP-{ride.id.slice(0, 5).toUpperCase()}
          </span>
        </div>

        {/* Route & Ride Information */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            {/* Route */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#36e0c0] bg-[#080b12]" />

                <span className="w-0.5 h-10 bg-[#252e3e] my-1" />

                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#8b78ff] bg-[#080b12]" />
              </div>

              <div className="space-y-4 flex-1">
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

            {/* Booking Requests */}
            {(ride.status === 'scheduled' || ride.status === 'full') && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Booking Requests
                  </span>

                  <span className="text-[10px] text-[#929bad]">
                    {pendingRequestCount} pending
                  </span>
                </div>

                <p className="text-[10px] text-[#c7cddd]">
                  {pendingRequestCount > 0
                    ? `You have ${pendingRequestCount} pending booking request(s).`
                    : 'There are no pending booking requests.'}
                </p>

                <button
                  type="button"
                  onClick={() => onManageRequests(ride.id)}
                  className="text-[10px] font-bold text-[#b6a8ff] hover:text-white transition"
                >
                  Manage Requests →
                </button>
              </div>
            )}

            {/* Vehicle Details */}
            {ride.vehicle && (
              <div className="flex items-center gap-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                {ride.vehicle.vehiclePhoto && (
                  <img
                    src={ride.vehicle.vehiclePhoto}
                    alt={`${ride.vehicle.brand} ${ride.vehicle.model}`}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                )}

                <div>
                  <p className="text-xs font-bold text-white">
                    {ride.vehicle.brand} {ride.vehicle.model}
                  </p>

                  <p className="text-[10px] text-[#929bad]">
                    {ride.vehicle.year} · {ride.vehicle.color}
                  </p>

                  <p className="text-[10px] text-[#929bad]">
                    {ride.vehicle.registrationNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Live Status */}
            {ride.status === 'started' && (
              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[10px] text-[#929bad]">
                  <span>Trip Status</span>

                  <span className="text-[#36e0c0] font-bold">In Progress</span>
                </div>

                <p className="text-[10px] text-[#36e0c0]">
                  Your ride is currently in progress.
                </p>
              </div>
            )}
          </div>

          {/* Ride Summary */}
          <div className="lg:col-span-4 rounded-xl border border-[#252e3e] bg-[#080b12] p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 border-b border-[#252e3e] pb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b78ff]/15 text-[#8b78ff]">
                🚗
              </div>

              <div>
                <p className="text-[10px] font-bold text-white">Ride Summary</p>

                <p className="text-[9px] text-[#929bad]">Your offered ride</p>
              </div>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Total Seats</span>
              <span className="text-white font-medium">{ride.totalSeats}</span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Available Seats</span>
              <span className="text-white font-medium">
                {ride.availableSeats}
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Capacity Booked</span>
              <span className="text-white font-medium">
                {bookedSeats} of {ride.totalSeats} Seats
              </span>
            </div>

            <div className="flex justify-between text-[#929bad]">
              <span>Price Per Seat</span>
              <span className="text-[#36e0c0] font-bold">
                ₹{ride.pricePerSeat}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-xs">
          <span className="text-[10px] text-[#36e0c0] flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Ride Information
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {ride.status === 'started' && (
              <button
                type="button"
                onClick={() => navigate('/rides/tracking')}
                className="rounded-xl bg-[#36e0c0] px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-[#2bc2a1]"
              >
                View Live Trip
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/rides/${ride.id}`)}
              className="rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
            >
              Trip Details
            </button>

            {canCancel && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => onCancel(ride.id)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
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
