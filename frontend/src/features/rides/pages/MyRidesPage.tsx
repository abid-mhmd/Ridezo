import { useEffect, useState } from 'react';
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
} from 'lucide-react';

import { getMyRides, cancelRide } from '../api/ride.api';
import {
  getMyBookings,
  getDriverBookingRequests,
} from '../../bookings/api/booking.api';

import type { Ride, RideStatus } from '../types/ride.types';
import type { Booking } from '../../bookings/types/booking-types';

import MyBookingCard from '../../bookings/components/MyBookingCard';
import RideRequestsPanel from '../components/RideRequestPanel';

import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import Pagination from '../../../components/layout/Pagination';

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
  onManageRequests: (rideId: string) => void;
  isCancelling: boolean;
  pendingRequestCount: number;
}

function RideCard({
  ride,
  onCancel,
  onManageRequests,
  isCancelling,
  pendingRequestCount,
}: RideCardProps) {
  const navigate = useNavigate();

  const canCancel = ride.status === 'scheduled' || ride.status === 'full';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] transition duration-200 hover:border-[#8b78ff]/40 shadow-xl">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Role & Status Banner Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252e3e] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 border-purple-500/30 text-[#b6a8ff]">
              🚗 YOU’RE DRIVING
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getStatusStyle(ride.status)}`}
            >
              {getStatusLabel(ride.status)}
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

        {/* Route Timeline Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-3">
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

            {/* Real Booking Request Information */}
            {ride.status === 'scheduled' && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Booking Requests
                  </span>

                  <span className="text-[10px] text-[#929bad]">
                    {pendingRequestCount} Pending
                  </span>
                </div>

                <p className="text-[10px] text-[#c7cddd]">
                  {pendingRequestCount > 0
                    ? `You have ${pendingRequestCount} pending booking request(s) for this ride.`
                    : 'No pending booking requests for this ride.'}
                </p>
              </div>
            )}

            {/* Live Progress Information */}
            {ride.status === 'started' && (
              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[10px] text-[#929bad]">
                  <span>Trip Status</span>

                  <span className="text-[#36e0c0] font-bold">In Progress</span>
                </div>

                <p className="text-[10px] text-[#36e0c0] mt-1">
                  Your ride is currently in progress.
                </p>
              </div>
            )}
          </div>

          {/* Right Summary Info Panel */}
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
                {ride.totalSeats - ride.availableSeats} of {ride.totalSeats}{' '}
                Seats
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

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-xs">
          <span className="text-[10px] text-[#36e0c0] flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Ride Information
          </span>

          <div className="flex items-center gap-2">
            {ride.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => onManageRequests(ride.id)}
                className="rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 cursor-pointer shadow-md"
              >
                Manage Requests
              </button>
            )}

            {ride.status === 'started' && (
              <button
                type="button"
                onClick={() => navigate('/rides/tracking')}
                className="rounded-xl bg-[#36e0c0] px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-[#2bc2a1] cursor-pointer shadow-md"
              >
                View Live Trip
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/rides/${ride.id}`)}
              className="rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white cursor-pointer"
            >
              Trip Details
            </button>

            {canCancel && (
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => onCancel(ride.id)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);

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
            getDriverBookingRequests(page, limit),
          ]);

        if (!isMounted) return;

        setRides(rideResponse.rides);
        setMyBookings(bookingResponse.bookings);
        setReceivedRequests(requestResponse.bookings);

        setTotalPages(
          Math.max(rideResponse.totalPages, bookingResponse.totalPages),
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

  function handleManageRequests(rideId: string) {
    setSelectedRideId((current) => (current === rideId ? null : rideId));
  }

  const pendingRequestCounts = receivedRequests.reduce<Record<string, number>>(
    (counts, booking) => {
      if (booking.status === 'pending') {
        counts[booking.rideId] = (counts[booking.rideId] || 0) + 1;
      }

      return counts;
    },
    {},
  );

  const hasActivities = rides.length > 0 || myBookings.length > 0;

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl space-y-6 pb-16 font-sans text-gray-100">
      {/* Active Trip Notification Banner */}
      <div className="rounded-2xl border border-[#36e0c0]/30 bg-gradient-to-r from-[#111722] via-[#161b27] to-[#111722] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#36e0c0]/15 text-[#36e0c0] animate-pulse">
            <Radio size={16} />
          </span>

          <div>
            <p className="text-xs font-bold text-white">Active Trip Updates</p>

            <p className="text-[10px] text-[#929bad]">
              Track your ongoing trips and journey updates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/rides/tracking')}
          className="rounded-xl bg-[#36e0c0] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#2bc2a1] cursor-pointer shrink-0 shadow-md"
        >
          Track Live
        </button>
      </div>

      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Rides
          </h1>

          <p className="mt-1 text-xs text-[#929bad]">
            Keep track of the rides you're taking and the rides you're sharing
            across the interstate highway corridors.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/rides/search')}
            className="rounded-xl border border-[#252e3e] bg-[#111722] px-4 py-2.5 text-xs font-semibold text-[#c7cddd] transition hover:text-white cursor-pointer"
          >
            Find a Ride
          </button>

          <button
            type="button"
            onClick={() => navigate('/rides/create')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:opacity-90 cursor-pointer"
          >
            <Plus size={15} />
            Offer a Ride
          </button>
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
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center space-y-3">
          <CircleAlert size={26} className="mx-auto text-red-400" />

          <p className="text-xs text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {/* Ride List */}
      {!isLoading && !error && hasActivities && (
        <section className="space-y-4">
          {/* Driving Cards */}
          {rides.map((ride) => (
            <div key={ride.id} className="space-y-4">
              <RideCard
                ride={ride}
                onCancel={handleCancelRide}
                onManageRequests={handleManageRequests}
                isCancelling={cancellingRideId === ride.id}
                pendingRequestCount={pendingRequestCounts[ride.id] || 0}
              />

              {/* Received Requests */}
              {selectedRideId === ride.id && (
                <RideRequestsPanel
                  rideId={ride.id}
                  bookings={receivedRequests}
                  onClose={() => setSelectedRideId(null)}
                />
              )}
            </div>
          ))}

          {/* Riding Cards */}
          {myBookings.map((booking) => (
            <MyBookingCard key={booking.id} booking={booking} />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasActivities && (
        <EmptyState
          title="No journeys recorded yet"
          description="You haven't offered or booked any rides yet. Create your first journey or search available corridors."
          icon={<MapPin size={24} />}
          action={
            <button
              type="button"
              onClick={() => navigate('/rides/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer shadow-lg"
            >
              <Plus size={15} />
              Offer a Ride
            </button>
          }
        />
      )}

      {/* Pagination */}
      {!isLoading && !error && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
