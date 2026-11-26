import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleAlert,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

import { getMyRides, cancelRide } from '../api/ride.api';
import {
  getMyBookings,
  getDriverBookingRequests,
  cancelBooking,
} from '../../bookings/api/booking.api';

import type { Ride } from '../types/ride.types';
import type { Booking } from '../../bookings/types/booking-types';

import MyRideCard from '../components/MyRideCard';
import MyBookingCard from '../../bookings/components/MyBookingCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import Pagination from '../../../components/layout/Pagination';

type TimeFilter = 'upcoming' | 'past' | 'all';
type RoleFilter = 'all' | 'riding' | 'driving';

function extractArray<T>(value: unknown, keys: string[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'object' && value !== null) {
    for (const key of keys) {
      const candidate = (value as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
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

  const [confirmTarget, setConfirmTarget] = useState<{
    type: 'ride' | 'booking';
    id: string;
  } | null>(null);

  const limit = 10;

  useEffect(() => {
    let isMounted = true;

    async function fetchMyActivities() {
      try {
        setIsLoading(true);
        setError('');

        const [rideResult, bookingResult, requestResult] =
          await Promise.allSettled([
            getMyRides(page, limit),
            getMyBookings(page, limit),
            getDriverBookingRequests(1, 50),
          ]);

        if (!isMounted) return;

        if (
          rideResult.status === 'rejected' &&
          bookingResult.status === 'rejected'
        ) {
          const reason = rideResult.reason ?? bookingResult.reason;
          throw reason instanceof Error
            ? reason
            : new Error('Unable to load your rides.');
        }

        const ridePayload =
          rideResult.status === 'fulfilled' ? rideResult.value : null;
        const bookingPayload =
          bookingResult.status === 'fulfilled' ? bookingResult.value : null;
        const requestPayload =
          requestResult.status === 'fulfilled' ? requestResult.value : null;

        const nextRides = extractArray<Ride>(ridePayload, ['rides', 'data']);
        const nextBookings = extractArray<Booking>(bookingPayload, [
          'bookings',
          'data',
        ]);
        const nextRequests = extractArray<Booking>(requestPayload, [
          'bookings',
          'requests',
          'data',
        ]);

        setRides(nextRides);
        setMyBookings(nextBookings);
        setReceivedRequests(nextRequests);
        setTotalPages(
          Math.max(
            1,
            Number(ridePayload?.totalPages) || 1,
            Number(bookingPayload?.totalPages) || 1,
          ),
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

  async function handleConfirmCancel() {
    if (!confirmTarget) return;

    const { type, id } = confirmTarget;
    setActionError('');
    setActionSuccess('');

    try {
      if (type === 'ride') {
        setCancellingRideId(id);
        await cancelRide(id);
        setActionSuccess('Ride cancelled successfully.');
      } else {
        setCancellingBookingId(id);
        await cancelBooking(id);
        setActionSuccess('Booking cancelled successfully.');
      }

      setConfirmTarget(null);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Unable to cancel ${type}.`,
      );
      setConfirmTarget(null);
    } finally {
      setCancellingRideId(null);
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
    const grouped: Record<string, { pending: Booking[]; accepted: Booking[] }> =
      {};

    if (!Array.isArray(receivedRequests)) {
      return grouped;
    }

    for (const booking of receivedRequests) {
      if (!booking?.rideId) continue;
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
          `${ride.origin?.name ?? ''} ${ride.destination?.name ?? ''}`.toLowerCase();
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
          `${booking.rideSnapshot?.origin?.name ?? ''} ${booking.rideSnapshot?.destination?.name ?? ''}`.toLowerCase();
        if (!text.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [myBookings, roleFilter, timeFilter, normalizedQuery]);

  const hasVisibleActivities =
    filteredRides.length > 0 || filteredBookings.length > 0;

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl space-y-6 pb-16 font-sans text-gray-100">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Rides
          </h1>
          <p className="mt-1 text-xs text-[#929bad]">
            Manage the rides you&apos;re taking and the rides you&apos;re
            offering.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {rides.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/my-rides/requests')}
              className="cursor-pointer rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-4 py-2.5 text-xs font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
            >
              Ride Requests
            </button>
          )}

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

      {/* Rides & Bookings List */}
      {!isLoading && !error && hasVisibleActivities && (
        <section className="space-y-4">
          {filteredRides.map((ride) => (
            <MyRideCard
              key={ride.id}
              ride={ride}
              onCancel={(id) => setConfirmTarget({ type: 'ride', id })}
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
              onCancel={(id) => setConfirmTarget({ type: 'booking', id })}
              isCancelling={cancellingBookingId === booking.id}
            />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasVisibleActivities && (
        <EmptyState
          title="No journeys found"
          description="No rides or bookings match your current filter. Offer a ride or search available routes."
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

      <ConfirmModal
        isOpen={confirmTarget !== null}
        title={
          confirmTarget?.type === 'ride' ? 'Cancel Ride?' : 'Cancel Booking?'
        }
        message={
          confirmTarget?.type === 'ride'
            ? 'Are you sure you want to cancel this ride? This action cannot be undone.'
            : 'Are you sure you want to cancel this booking? Your reserved seats will be released.'
        }
        confirmLabel={
          confirmTarget?.type === 'ride'
            ? 'Yes, Cancel Ride'
            : 'Yes, Cancel Booking'
        }
        isLoading={cancellingRideId !== null || cancellingBookingId !== null}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
}
