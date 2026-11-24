import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CarFront,
  Check,
  Clock,
  ExternalLink,
  IndianRupee,
  Plus,
  Mail,
  Eye,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import {
  getDriverBookingRequests,
  respondToBookingRequest,
} from '../../bookings/api/booking.api';
import { getMyRides } from '../api/ride.api';
import type {
  Booking,
  BookingStatus,
} from '../../bookings/types/booking-types';
import type { Ride } from '../types/ride.types';

type FilterTab = 'pending' | 'accepted' | 'rejected' | 'all';

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function getPassengerName(booking: Booking) {
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

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'PENDING HOST DECISION',
        classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      };
    case 'accepted':
      return {
        label: 'ACCEPTED',
        classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      };
    case 'rejected':
      return {
        label: 'DECLINED',
        classes: 'border-red-500/30 bg-red-500/10 text-red-300',
      };
    case 'cancelled':
      return {
        label: 'CANCELLED BY PASSENGER',
        classes: 'border-gray-500/30 bg-gray-500/10 text-gray-300',
      };
    default:
      return {
        label: status.toUpperCase(),
        classes: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      };
  }
}

export default function RideRequestsPage() {
  const { rideId } = useParams<{ rideId?: string }>();
  const navigate = useNavigate();

  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<string>(rideId ?? '');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);

  // Inline decline reason state
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (rideId) setSelectedRideId(rideId);
  }, [rideId]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [ridesRes, reqRes] = await Promise.all([
        getMyRides(1, 50),
        getDriverBookingRequests(1, 50),
      ]);

      setRides(ridesRes.rides);
      setBookings(reqRes.bookings);

      if (!rideId && !selectedRideId && ridesRes.rides.length > 0) {
        setSelectedRideId(ridesRes.rides[0].id);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to load booking requests.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const rideBookings = useMemo(() => {
    if (!selectedRideId) return bookings;
    return bookings.filter((b) => b.rideId === selectedRideId);
  }, [bookings, selectedRideId]);

  const counts = useMemo(
    () => ({
      pending: rideBookings.filter((b) => b.status === 'pending').length,
      accepted: rideBookings.filter((b) => b.status === 'accepted').length,
      rejected: rideBookings.filter(
        (b) => b.status === 'rejected' || b.status === 'cancelled',
      ).length,
      all: rideBookings.length,
    }),
    [rideBookings],
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return rideBookings;
    if (activeTab === 'rejected') {
      return rideBookings.filter(
        (b) => b.status === 'rejected' || b.status === 'cancelled',
      );
    }
    return rideBookings.filter((b) => b.status === activeTab);
  }, [rideBookings, activeTab]);

  const handleAccept = async (bookingId: string) => {
    setBusyBookingId(bookingId);
    setError('');
    try {
      await respondToBookingRequest(bookingId, { decision: 'accepted' });
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to accept request.',
      );
    } finally {
      setBusyBookingId(null);
    }
  };

  const handleConfirmDecline = async (bookingId: string) => {
    setBusyBookingId(bookingId);
    setError('');
    try {
      await respondToBookingRequest(bookingId, {
        decision: 'rejected',
        rejectionReason: declineReason.trim() || 'Declined by driver.',
      });
      setDecliningId(null);
      setDeclineReason('');
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to decline request.',
      );
    } finally {
      setBusyBookingId(null);
    }
  };

  const currentRide = rides.find((r) => r.id === selectedRideId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 font-sans text-white">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-[#929bad]">
            My Rides <span className="mx-1">/</span>{' '}
            <span className="text-white">Ride Requests</span>
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ride Requests
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
              <ShieldCheck size={11} />
              Host Manager
            </span>
          </div>
          <p className="mt-1 text-xs text-[#929bad]">
            Review and manage seat requests from passengers joining your rides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/my-rides')}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to My Rides
          </button>

          <button
            type="button"
            onClick={() => navigate('/rides/create')}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#8b78ff]/40 bg-[#8b78ff]/15 px-3.5 py-2 text-xs font-semibold text-[#c7bfff] transition hover:bg-[#8b78ff]/25"
          >
            <Plus size={14} />
            New Ride
          </button>
        </div>
      </div>

      {/* Select Ride to Manage Requests */}
      {rides.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-[#252e3e] bg-[#111722] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
              Select Ride to Manage Requests
            </p>
            {currentRide?.vehicle && (
              <p className="flex items-center gap-1.5 text-[11px] text-[#c7cddd]">
                <CarFront size={13} className="text-[#8b78ff]" />
                <span>
                  {currentRide.vehicle.brand} {currentRide.vehicle.model} (
                  <span className="font-mono">
                    {currentRide.vehicle.registrationNumber}
                  </span>
                  )
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {rides.map((r) => {
              const active = r.id === selectedRideId;
              const booked = r.totalSeats - r.availableSeats;
              const pct =
                r.totalSeats > 0
                  ? Math.round((booked / r.totalSeats) * 100)
                  : 0;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRideId(r.id)}
                  className={`min-w-[270px] shrink-0 cursor-pointer rounded-xl border p-3.5 text-left transition ${
                    active
                      ? 'border-[#8b78ff] bg-[#8b78ff]/10 shadow-md'
                      : 'border-[#252e3e] bg-[#080b12] hover:border-[#3b4a68]'
                  }`}
                >
                  <p className="truncate text-xs font-bold text-white">
                    {r.origin.name} → {r.destination.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#929bad]">
                    <Calendar size={11} />
                    {formatShortDate(r.departureTime)}
                  </p>

                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#c7cddd]">
                        Seat Capacity: {booked} of {r.totalSeats} booked (
                        {r.availableSeats} left)
                      </span>
                      <span className="font-mono text-[#8b78ff]">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1b2230]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8b78ff] to-[#ec4899]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Status Filter Tabs & Remaining Capacity */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'accepted', label: 'Accepted', count: counts.accepted },
              {
                id: 'rejected',
                label: 'Rejected / Declined',
                count: counts.rejected,
              },
              { id: 'all', label: 'All Requests', count: counts.all },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'border-[#8b78ff] bg-[#8b78ff]/20 text-white'
                  : 'border-[#252e3e] bg-[#111722] text-[#929bad] hover:text-white'
              }`}
            >
              {tab.label}{' '}
              <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {currentRide && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#929bad]">
              Available capacity:{' '}
              <strong className="text-[#36e0c0]">
                {currentRide.availableSeats} Seat
                {currentRide.availableSeats === 1 ? '' : 's'} Remaining
              </strong>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Request Cards */}
      {isLoading ? (
        <LoadingState message="Loading ride requests..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No requests in this tab"
          description="Passenger booking requests for your selected ride will appear here."
          icon={<Users size={24} />}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((item) => {
            const isBusy = busyBookingId === item.id;
            const isDeclining = decliningId === item.id;
            const badge = getStatusBadge(item.status);

            return (
              <article
                key={item.id}
                className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl"
              >
                {/* Top Row: Passenger & Status */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#252e3e] pb-4">
                  <div className="flex items-center gap-3">
                    {item.passengerSnapshot?.profilePhoto ? (
                      <img
                        src={item.passengerSnapshot.profilePhoto}
                        alt={getPassengerName(item)}
                        className="h-11 w-11 rounded-full border border-[#36e0c0]/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8b78ff]/15 text-[#b6a8ff]">
                        <UserRound size={20} />
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-white">
                          {getPassengerName(item)}
                        </p>
                        <span className="rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-2 py-0.5 text-[10px] font-medium text-[#36e0c0]">
                          Ridezo Passenger
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#929bad]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Requested {formatDateTime(item.createdAt)}
                        </span>

                        {item.passengerSnapshot?.phone && (
                          <a
                            href={`tel:${item.passengerSnapshot.phone}`}
                            className="inline-flex items-center gap-1 font-medium text-[#36e0c0] hover:underline"
                          >
                            <Phone size={11} />
                            {item.passengerSnapshot.phone}
                          </a>
                        )}

                        {item.passengerSnapshot?.email && (
                          <a
                            href={`mailto:${item.passengerSnapshot.email}`}
                            className="inline-flex items-center gap-1 text-[#c7cddd] hover:text-white"
                          >
                            <Mail size={11} />
                            {item.passengerSnapshot.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Middle Grid: Route Segment & Seating/Fare */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Left: Route & Passenger Note */}
                  <div className="space-y-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                      Passenger Route Segment &amp; Times
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-white">
                          Pickup: {item.rideSnapshot.origin.name}
                        </p>
                        <p className="text-[11px] text-[#929bad]">
                          {item.rideSnapshot.origin.address}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Drop-off: {item.rideSnapshot.destination.name}
                        </p>
                        <p className="text-[11px] text-[#929bad]">
                          {item.rideSnapshot.destination.address}
                        </p>
                      </div>
                    </div>

                    {item.message && (
                      <div className="rounded-lg border border-[#252e3e] bg-[#111722] p-2.5 text-[11px] italic text-[#c7cddd]">
                        &ldquo;{item.message}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Right: Seats & Fare */}
                  <div className="flex flex-col justify-between space-y-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                        Seating &amp; Fare Details
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#252e3e] bg-[#111722] px-2.5 py-1.5 text-[#c7cddd]">
                          <Users size={12} className="text-[#8b78ff]" />
                          Seats: <strong>{item.seatsRequested}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[#36e0c0]/20 bg-[#36e0c0]/10 px-2.5 py-1.5 font-semibold text-[#36e0c0]">
                          <IndianRupee size={12} />
                          Fare: ₹{item.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {item.rejectionReason && item.status === 'rejected' && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                        <strong>Decline reason:</strong> {item.rejectionReason}
                      </div>
                    )}

                    {/* Inline Decline Reason Input */}
                    {isDeclining && (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Reason for declining (optional)..."
                          className="w-full rounded-lg border border-[#252e3e] bg-[#111722] px-3 py-2 text-xs text-white placeholder-[#657086] outline-none focus:border-[#8b78ff]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDecliningId(null);
                              setDeclineReason('');
                            }}
                            className="cursor-pointer rounded-lg border border-[#252e3e] px-3 py-1 text-[11px] text-[#929bad] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleConfirmDecline(item.id)}
                            className="cursor-pointer rounded-lg bg-red-500/20 px-3 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
                          >
                            {isBusy ? 'Saving...' : 'Confirm Decline'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Ride Info & Host Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3">
                  <p className="text-[11px] text-[#929bad]">
                    Ride:{' '}
                    <span className="font-medium text-white">
                      {item.rideSnapshot.origin.name} →{' '}
                      {item.rideSnapshot.destination.name}
                    </span>{' '}
                    ({formatShortDate(item.rideSnapshot.departureTime)})
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/rides/${item.rideId}/host`)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
                    >
                      <ExternalLink size={13} />
                      View Ride
                    </button>
                    {item.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/bookings/${item.id}?role=driver`)
                        }
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-3.5 py-2 text-xs font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
                      >
                        <Eye size={13} />
                        View Booking
                      </button>
                    )}

                    {item.status === 'pending' && !isDeclining && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setDecliningId(item.id);
                            setDeclineReason('');
                          }}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X size={14} />
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleAccept(item.id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                        >
                          <Check size={14} />
                          {isBusy ? 'Saving...' : 'Accept Request'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
