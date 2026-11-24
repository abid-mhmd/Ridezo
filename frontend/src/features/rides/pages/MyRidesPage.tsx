import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  RefreshCw,
  CircleAlert,
  XCircle,
  Radio,
  ShieldCheck,
  AlertCircle,
  Search,
  CheckCircle2,
  Eye,
  Users,
} from 'lucide-react';

import { getMyRides, cancelRide } from '../api/ride.api';
import {
  getMyBookings,
  getDriverBookingRequests,
  cancelBooking,
} from '../../bookings/api/booking.api';

import type { Ride, RideStatus } from '../types/ride.types';
import type { Booking } from '../../bookings/types/booking-types';

import MyBookingCard from '../../bookings/components/MyBookingCard';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import Pagination from '../../../components/layout/Pagination';

type TimeFilter = 'upcoming' | 'past' | 'all';
type RoleFilter = 'all' | 'riding' | 'driving';

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

function getStatusLabel(status: RideStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface RideCardProps {
  ride: Ride;
  onCancel: (rideId: string) => void;
  onManageRequests: (rideId: string, tab?: 'pending' | 'accepted') => void;
  isCancelling: boolean;
  pendingBookings: Booking[];
  acceptedBookings: Booking[];
}

function RideCard({
  ride,
  onCancel,
  onManageRequests,
  isCancelling,
  pendingBookings,
  acceptedBookings,
}: RideCardProps) {
  const navigate = useNavigate();

  const canCancel = ride.status === 'scheduled' || ride.status === 'full';
  const isActiveRide = ride.status === 'scheduled' || ride.status === 'full';
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
        {/* Role & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#b6a8ff]">
              🚗 YOU&apos;RE DRIVING
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getStatusStyle(ride.status)}`}
            >
              {getStatusLabel(ride.status)}
            </span>

            {ride.status === 'started' && (
              <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-[#36e0c0]/10 px-2 py-0.5 text-[9px] font-bold text-[#36e0c0]">
                ● LIVE NOW
              </span>
            )}
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

            {/* Pending Requests Card — ONLY shown when there are pending requests */}
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

            {/* Confirmed Bookings Card — ONLY shown when requests have been accepted */}
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
                      <div className="flex items-center gap-2 text-[11px]">
                        <Users size={12} className="text-[#36e0c0]" />
                        <span className="font-semibold text-white">
                          Passenger #{booking.passengerId.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[#929bad]">
                          · {booking.seatsRequested} seat
                          {booking.seatsRequested === 1 ? '' : 's'} · ₹
                          {booking.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/bookings/${booking.id}?role=driver`)}
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
                {ride.totalSeats - ride.availableSeats} of {ride.totalSeats}{' '}
                Seats
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
            {/* Show Manage Requests ONLY when there are pending requests */}
            {isActiveRide && pendingCount > 0 && (
              <button
                type="button"
                onClick={() => onManageRequests(ride.id, 'pending')}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Manage Requests ({pendingCount})
              </button>
            )}

            {/* Show View Bookings when there are accepted bookings */}
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

            {canCancel && (
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

export default function MyRidesPage() {
  const navigate = useNavigate();

  const [rides, setRides] = useState<Ride[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Booking[]>([]);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const limit = 10;

  useEffect(() => {
    let isMounted = true;

    async function fetchMyActivities() {
      try {
        setIsLoading(true);
        setError('');

        const [rideResponse, bookingResponse, requestResponse] =
          await Promise.all([
            getMyRides(page, limit),
            getMyBookings(page, limit),
            getDriverBookingRequests(1, 50),
          ]);

        if (!isMounted) return;

        setRides(rideResponse.rides);
        setMyBookings(bookingResponse.bookings);
        setReceivedRequests(requestResponse.bookings);

        setTotalPages(
          Math.max(1, rideResponse.totalPages, bookingResponse.totalPages),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load your rides.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchMyActivities();

    return () => {
      isMounted = false;
    };
  }, [page, refreshKey]);

  async function handleCancelRide(rideId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this ride? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      setCancellingRideId(rideId);
      setActionError('');
      setActionSuccess('');

      await cancelRide(rideId);

      setActionSuccess('Ride cancelled successfully.');
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to cancel ride.',
      );
    } finally {
      setCancellingRideId(null);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? Your reserved seats will be released.',
    );
    if (!confirmed) return;

    try {
      setCancellingBookingId(bookingId);
      setActionError('');
      setActionSuccess('');

      await cancelBooking(bookingId);

      setActionSuccess('Booking cancelled successfully.');
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to cancel booking.',
      );
    } finally {
      setCancellingBookingId(null);
    }
  }

  function handleManageRequests(
    targetRideId: string,
    tab: 'pending' | 'accepted' = 'pending',
  ) {
    navigate(`/rides/${targetRideId}/requests?tab=${tab}`);
  }

  const bookingsByRide = useMemo(() => {
    const grouped: Record<
      string,
      { pending: Booking[]; accepted: Booking[] }
    > = {};

    for (const booking of receivedRequests) {
      if (!grouped[booking.rideId]) {
        grouped[booking.rideId] = { pending: [], accepted: [] };
      }
      if (booking.status === 'pending') {
        grouped[booking.rideId].pending.push(booking);
      } else if (booking.status === 'accepted') {
        grouped[booking.rideId].accepted.push(booking);
      }
    }

    return grouped;
  }, [receivedRequests]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRides = useMemo(() => {
    if (roleFilter === 'riding') return [];

    return rides.filter((ride) => {
      const isPast = ride.status === 'completed' || ride.status === 'cancelled';

      if (timeFilter === 'upcoming' && isPast) return false;
      if (timeFilter === 'past' && !isPast) return false;

      if (normalizedQuery) {
        const text =
          `${ride.origin.name} ${ride.destination.name}`.toLowerCase();
        if (!text.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [rides, roleFilter, timeFilter, normalizedQuery]);

  const filteredBookings = useMemo(() => {
    if (roleFilter === 'driving') return [];

    return myBookings.filter((booking) => {
      const isPast =
        booking.status === 'completed' ||
        booking.status === 'cancelled' ||
        booking.status === 'rejected';

      if (timeFilter === 'upcoming' && isPast) return false;
      if (timeFilter === 'past' && !isPast) return false;

      if (normalizedQuery) {
        const text =
          `${booking.rideSnapshot.origin.name} ${booking.rideSnapshot.destination.name}`.toLowerCase();
        if (!text.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [myBookings, roleFilter, timeFilter, normalizedQuery]);

  const hasVisibleActivities =
    filteredRides.length > 0 || filteredBookings.length > 0;

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl space-y-6 pb-16 font-sans text-gray-100">
      {/* Active Trip Banner */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#36e0c0]/30 bg-gradient-to-r from-[#111722] via-[#161b27] to-[#111722] p-4 shadow-xl sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 animate-pulse items-center justify-center rounded-xl bg-[#36e0c0]/15 text-[#36e0c0]">
            <Radio size={16} />
          </span>
          <div>
            <p className="text-xs font-bold text-white">Active Trip Updates</p>
            <p className="text-[10px] text-[#929bad]">
              Track your ongoing trips, booking requests, and shared rides.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my-rides/requests')}
          className="shrink-0 cursor-pointer rounded-xl bg-[#36e0c0] px-4 py-2 text-xs font-semibold text-black shadow-md transition hover:bg-[#2bc2a1]"
        >
          View All Requests
        </button>
      </div>

      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Rides
          </h1>
          <p className="mt-1 text-xs text-[#929bad]">
            Keep track of the rides you&apos;re taking and the rides you&apos;re
            sharing across the interstate highway corridors.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/rides/search')}
            className="cursor-pointer rounded-xl border border-[#252e3e] bg-[#111722] px-4 py-2.5 text-xs font-semibold text-[#c7cddd] transition hover:text-white"
          >
            Find a Ride
          </button>

          <button
            type="button"
            onClick={() => navigate('/rides/create')}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:opacity-90"
          >
            <Plus size={15} />
            Offer a Ride
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex rounded-xl border border-[#252e3e] bg-[#111722] p-1">
            {(['upcoming', 'past', 'all'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTimeFilter(tab)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  timeFilter === tab
                    ? 'bg-[#8b78ff]/20 text-white'
                    : 'text-[#929bad] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex rounded-xl border border-[#252e3e] bg-[#111722] p-1">
            {(
              [
                { id: 'all', label: 'All Rides' },
                { id: 'riding', label: 'Riding' },
                { id: 'driving', label: 'Driving' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  roleFilter === tab.id
                    ? 'bg-[#36e0c0]/20 text-[#36e0c0]'
                    : 'text-[#929bad] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929bad]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by city or route..."
            className="w-full rounded-xl border border-[#252e3e] bg-[#111722] py-2 pl-9 pr-3 text-xs text-white placeholder-[#657086] outline-none focus:border-[#8b78ff]"
          />
        </div>
      </section>

      {/* Action Feedback */}
      {actionSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#36e0c0]/20 bg-[#36e0c0]/10 p-3.5 text-xs text-[#36e0c0]">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess('')}>
            <XCircle size={15} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError('')}>
            <XCircle size={15} />
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingState message="Loading your journey records..." />}

      {/* Error */}
      {!isLoading && error && (
        <div className="space-y-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <CircleAlert size={26} className="mx-auto text-red-400" />
          <p className="text-xs text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && hasVisibleActivities && (
        <section className="space-y-4">
          {filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onCancel={handleCancelRide}
              onManageRequests={handleManageRequests}
              isCancelling={cancellingRideId === ride.id}
              pendingBookings={bookingsByRide[ride.id]?.pending ?? []}
              acceptedBookings={bookingsByRide[ride.id]?.accepted ?? []}
            />
          ))}

          {filteredBookings.map((booking) => (
            <MyBookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              isCancelling={cancellingBookingId === booking.id}
            />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasVisibleActivities && (
        <EmptyState
          title="No journeys found"
          description="No rides or bookings match your current filter. Offer a ride or search available corridors."
          icon={<MapPin size={24} />}
          action={
            <button
              type="button"
              onClick={() => navigate('/rides/create')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 py-2.5 text-xs font-semibold text-white shadow-lg"
            >
              <Plus size={15} />
              Offer a Ride
            </button>
          }
        />
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}