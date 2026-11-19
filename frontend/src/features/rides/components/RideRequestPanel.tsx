import {
  CalendarDays,
  Users,
  IndianRupee,
  MessageSquare,
  X,
  ClipboardList,
} from 'lucide-react';

import type { Booking } from '../../bookings/types/booking-types';

interface RideRequestsPanelProps {
  rideId: string;
  bookings: Booking[];
  onClose: () => void;
}

function formatDate(value: string): string {
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

function getStatusStyle(status: Booking['status']): string {
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

export default function RideRequestsPanel({
  rideId,
  bookings,
  onClose,
}: RideRequestsPanelProps) {
  const rideBookings = bookings.filter((booking) => booking.rideId === rideId);

  const pendingCount = rideBookings.filter(
    (booking) => booking.status === 'pending',
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#8b78ff]/30 bg-[#111722] shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b78ff]/15 text-[#b6a8ff]">
            <ClipboardList size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Booking Requests</h3>

            <p className="text-[10px] text-[#929bad]">
              Manage passengers for this ride
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#30394b] bg-[#161b27] p-2 text-[#929bad] transition hover:text-white"
          aria-label="Close booking requests"
        >
          <X size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
        <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
          <p className="text-[10px] text-[#929bad]">Total Requests</p>

          <p className="mt-1 text-xl font-bold text-white">
            {rideBookings.length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[10px] text-[#929bad]">Pending Requests</p>

          <p className="mt-1 text-xl font-bold text-amber-400">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Requests */}
      <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {rideBookings.length === 0 ? (
          <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-8 text-center">
            <Users size={25} className="mx-auto text-[#657086]" />

            <p className="mt-3 text-xs font-semibold text-white">
              No booking requests yet
            </p>

            <p className="mt-1 text-[10px] text-[#929bad]">
              Passenger booking requests will appear here.
            </p>
          </div>
        ) : (
          rideBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4 space-y-3"
            >
              {/* Request Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white">
                    Booking Request
                  </p>

                  <p className="mt-1 text-[10px] text-[#929bad] font-mono">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase ${getStatusStyle(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#8b78ff]" />

                  <div>
                    <p className="text-[9px] text-[#929bad]">Seats Requested</p>

                    <p className="text-xs font-semibold text-white">
                      {booking.seatsRequested}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-[#36e0c0]" />

                  <div>
                    <p className="text-[9px] text-[#929bad]">Total Amount</p>

                    <p className="text-xs font-semibold text-white">
                      ₹{booking.totalPrice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 col-span-2">
                  <CalendarDays size={14} className="text-[#8b78ff]" />

                  <div>
                    <p className="text-[9px] text-[#929bad]">Requested On</p>

                    <p className="text-[10px] font-medium text-white">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Message */}
              {booking.message && (
                <div className="rounded-lg border border-[#252e3e] bg-[#111722] p-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-[#8b78ff]" />

                    <p className="text-[10px] font-semibold text-[#929bad]">
                      Passenger Message
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[#c7cddd]">
                    {booking.message}
                  </p>
                </div>
              )}

              {/* Passenger ID */}
              <div className="border-t border-[#252e3e] pt-2">
                <p className="text-[9px] text-[#657086]">Passenger Reference</p>

                <p className="mt-1 text-[10px] text-[#929bad] font-mono">
                  {booking.passengerId}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
