import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Users,
  IndianRupee,
  ArrowRight,
  LoaderCircle,
  CarFront,
  CalendarDays,
  Search,
  MapPin,
  Route,
  RefreshCw,
  CircleAlert,
  XCircle,
} from 'lucide-react';

import { getMyRides, cancelRide } from '../api/ride.api';
import type { Ride, RideStatus } from '../types/ride.types';

const FILTERS: { label: string; value: 'all' | RideStatus }[] = [
  { label: 'All Rides', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Full', value: 'full' },
  { label: 'Started', value: 'started' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

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

function getAvailabilityPercentage(ride: Ride): number {
  if (ride.totalSeats <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, (ride.availableSeats / ride.totalSeats) * 100),
  );
}

interface RideCardProps {
  ride: Ride;
  onCancel: (rideId: string) => void;
  isCancelling: boolean;
}

function RideCard({ ride, onCancel, isCancelling }: RideCardProps) {
  const navigate = useNavigate();

  const availablePercentage = getAvailabilityPercentage(ride);

  const canCancel = ride.status === 'scheduled' || ride.status === 'full';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] transition duration-200 hover:border-[#8b78ff]/40">
      <div className="p-4 sm:p-5">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(ride.status)}`}
            >
              {getStatusLabel(ride.status)}
            </span>

            <span className="text-[10px] text-[#657086]">
              Ride ID: {ride.id.slice(-8)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-bold text-white">
            <IndianRupee size={14} className="text-[#36e0c0]" />
            {ride.pricePerSeat}

            <span className="text-[10px] font-normal text-[#929bad]">
              / seat
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px]">
          {/* Left Side */}
          <div className="min-w-0">
            {/* Route */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-3 w-3 rounded-full border-2 border-[#36e0c0] bg-[#36e0c0]/20" />

                <span className="my-1 h-12 w-px border-l border-dashed border-[#4a556b]" />

                <span className="h-3 w-3 rounded-full border-2 border-[#a18cff] bg-[#a18cff]/20" />
              </div>

              <div className="min-w-0 flex-1 space-y-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929bad]">
                    Departure
                  </p>

                  <h3 className="mt-1 truncate text-sm font-semibold text-white">
                    {ride.origin.name}
                  </h3>

                  <p className="mt-1 truncate text-[11px] text-[#929bad]">
                    {ride.origin.address}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929bad]">
                    Destination
                  </p>

                  <h3 className="mt-1 truncate text-sm font-semibold text-white">
                    {ride.destination.name}
                  </h3>

                  <p className="mt-1 truncate text-[11px] text-[#929bad]">
                    {ride.destination.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Intermediate Stops */}
            {ride.stops.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#252e3e] bg-[#080b12] px-3 py-2.5">
                <Route size={14} className="mt-0.5 shrink-0 text-[#8b78ff]" />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#c7cddd]">
                    Intermediate Stops ({ride.stops.length})
                  </p>

                  <p className="mt-1 text-[11px] text-[#929bad]">
                    {ride.stops.map((stop) => stop.name).join(' → ')}
                  </p>
                </div>
              </div>
            )}

            {/* Departure and Seats */}
            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#252e3e] pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b78ff]/10 text-[#a18cff]">
                  <Clock size={15} />
                </div>

                <div>
                  <p className="text-[10px] text-[#929bad]">Departure Time</p>

                  <p className="mt-1 text-xs font-medium text-white">
                    {formatDepartureTime(ride.departureTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#36e0c0]/10 text-[#36e0c0]">
                  <Users size={15} />
                </div>

                <div>
                  <p className="text-[10px] text-[#929bad]">Available Seats</p>

                  <p className="mt-1 text-xs font-medium text-white">
                    {ride.availableSeats} of {ride.totalSeats}
                  </p>
                </div>
              </div>
            </div>

            {/* Seat Availability */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-[#929bad]">
                  Seat availability
                </span>

                <span className="text-[10px] font-semibold text-[#36e0c0]">
                  {Math.round(availablePercentage)}% available
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#252e3e]">
                <div
                  className="h-full rounded-full bg-[#36e0c0] transition-all"
                  style={{ width: `${availablePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Information Panel */}
          <div className="flex flex-col justify-between rounded-xl border border-[#252e3e] bg-[#0c111b] p-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b78ff]/10 text-[#a18cff]">
                  <CarFront size={16} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#929bad]">
                    Vehicle
                  </p>

                  <p className="text-xs font-medium text-white">
                    Vehicle information
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[10px] text-[#657086]">Vehicle ID</p>

                  <p className="mt-1 break-all text-[11px] text-[#c7cddd]">
                    {ride.vehicleId}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#657086]">Total Seats</p>

                  <p className="mt-1 text-xs font-semibold text-white">
                    {ride.totalSeats}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[#657086]">Price Per Seat</p>

                  <p className="mt-1 flex items-center text-xs font-semibold text-[#36e0c0]">
                    <IndianRupee size={12} />
                    {ride.pricePerSeat}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-5 space-y-2 border-t border-[#252e3e] pt-4">
              <button
                type="button"
                onClick={() => navigate(`/rides/${ride.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8b78ff]/10 px-3 py-2.5 text-xs font-semibold text-[#b6a8ff] transition hover:bg-[#8b78ff] hover:text-white"
              >
                View Ride Details
                <ArrowRight size={14} />
              </button>

              {canCancel && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => onCancel(ride.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      Cancel Ride
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyRidesPage() {
  const navigate = useNavigate();

  const [rides, setRides] = useState<Ride[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<'all' | RideStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const limit = 10;

  useEffect(() => {
    let isMounted = true;

    async function fetchMyRides() {
      try {
        setIsLoading(true);
        setError('');

        const response = await getMyRides(page, limit);

        if (!isMounted) return;

        setRides(response.rides);
        setTotal(response.total);
        setTotalPages(response.totalPages);
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

    void fetchMyRides();

    return () => {
      isMounted = false;
    };
  }, [page, refreshKey]);

  const filteredRides = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return rides.filter((ride) => {
      const matchesStatus =
        statusFilter === 'all' || ride.status === statusFilter;

      const matchesSearch =
        !searchValue ||
        ride.origin.name.toLowerCase().includes(searchValue) ||
        ride.destination.name.toLowerCase().includes(searchValue) ||
        ride.stops.some((stop) =>
          stop.name.toLowerCase().includes(searchValue),
        );

      return matchesStatus && matchesSearch;
    });
  }, [rides, statusFilter, searchTerm]);

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

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl space-y-6 pb-12 text-gray-100">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#36e0c0]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#36e0c0]">
              Your journeys
            </p>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            My Rides
          </h1>

          <p className="mt-2 text-xs text-[#929bad] sm:text-sm">
            Manage and track all the rides you've offered.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/rides/search')}
            className="rounded-xl border border-[#30394b] bg-[#111722] px-4 py-3 text-xs font-semibold text-white transition hover:border-[#8b78ff]/50 hover:bg-[#161b27]"
          >
            Find Rides
          </button>

          <button
            type="button"
            onClick={() => navigate('/rides/create')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b78ff] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#7964f5]"
          >
            <Plus size={16} />
            Offer a New Ride
          </button>
        </div>
      </section>

      {/* Information Banner */}
      <section className="flex items-center gap-3 rounded-xl border border-[#36e0c0]/20 bg-[#36e0c0]/5 px-4 py-3">
        <CircleAlert size={16} className="shrink-0 text-[#36e0c0]" />

        <p className="text-xs leading-relaxed text-[#aab8bd]">
          Keep your ride details updated and make your journeys easier for
          passengers to discover.
        </p>
      </section>

      {/* Action Feedback */}
      {actionSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#36e0c0]/20 bg-[#36e0c0]/5 p-4 text-xs text-[#36e0c0]">
          <span>{actionSuccess}</span>

          <button
            type="button"
            onClick={() => setActionSuccess('')}
            aria-label="Dismiss success message"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError('')}
            aria-label="Dismiss error message"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#252e3e] bg-[#111722] p-4">
          <div className="flex items-center gap-2 text-[#a18cff]">
            <CarFront size={16} />
            <span className="text-[10px] text-[#929bad]">Total Rides</span>
          </div>

          <p className="mt-2 text-xl font-bold text-white">{total}</p>
        </div>

        <div className="rounded-xl border border-[#252e3e] bg-[#111722] p-4">
          <div className="flex items-center gap-2 text-[#36e0c0]">
            <CalendarDays size={16} />
            <span className="text-[10px] text-[#929bad]">Current Page</span>
          </div>

          <p className="mt-2 text-xl font-bold text-white">
            {totalPages === 0 ? 0 : page} / {totalPages}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-[#252e3e] bg-[#111722] p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Users size={16} />
            <span className="text-[10px] text-[#929bad]">
              Rides on this page
            </span>
          </div>

          <p className="mt-2 text-xl font-bold text-white">{rides.length}</p>
        </div>
      </section>

      {/* Filters and Search */}
      <section>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition ${
                  statusFilter === filter.value
                    ? 'border-[#8b78ff] bg-[#8b78ff] text-white'
                    : 'border-[#252e3e] bg-[#111722] text-[#929bad] hover:border-[#8b78ff]/50 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657086]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search locations..."
              className="w-full rounded-xl border border-[#252e3e] bg-[#111722] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-[#657086] transition focus:border-[#8b78ff]"
            />
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-64 items-center justify-center text-sm text-[#929bad]">
          <LoaderCircle size={20} className="mr-2 animate-spin" />
          Loading your rides...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <CircleAlert size={24} className="mx-auto text-red-400" />

          <p className="mt-3 text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {/* Ride List */}
      {!isLoading && !error && filteredRides.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Your Offered Rides
              </h2>

              <p className="mt-1 text-[10px] text-[#657086]">
                Showing rides from your current page.
              </p>
            </div>

            <span className="text-xs text-[#929bad]">
              {filteredRides.length} results
            </span>
          </div>

          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onCancel={handleCancelRide}
                isCancelling={cancellingRideId === ride.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredRides.length === 0 && (
        <div className="rounded-2xl border border-[#252e3e] bg-[#111722] px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8b78ff]/10 text-[#a18cff]">
            <MapPin size={26} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            {rides.length === 0 ? 'No rides yet' : 'No matching rides'}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#929bad]">
            {rides.length === 0
              ? "You haven't offered any rides yet. Create your first ride and share your journey with other travellers."
              : 'No rides match your current search or status filter. Try changing your filters.'}
          </p>

          {rides.length === 0 && (
            <button
              type="button"
              onClick={() => navigate('/rides/create')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8b78ff] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#7964f5]"
            >
              <Plus size={16} />
              Offer a Ride
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-[#252e3e] pt-6">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl border border-[#252e3e] bg-[#111722] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#161b27] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-xs text-[#929bad]">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl border border-[#252e3e] bg-[#111722] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#161b27] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
