import { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiNavigation,
  FiXCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import AdminPageHeader from '../../components/common/AdminPageHeader';
import AdminSummaryCard from '../../components/common/AdminSummaryCard';
import AdminSearchBar from '../../components/common/AdminSearchBar';
import AdminTableContainer from '../../components/common/AdminTableContainer';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../../../components/layout/Pagination';
import UserAvatar from '../../../../components/UserAvatar';
import EmptyState from '../../../../components/EmptyState';
import LoadingState from '../../../../components/LoadingState';
import AdminRideDetailsModal from '../components/adminRideDetailsModal';
import { getAdminRides } from '../api/admin-rides.api';
import type {
  AdminRideListResponse,
  AdminRideStatus,
} from '../types/admin-ride.types';

interface AdminRidesPageProps {
  accessToken: string;
}

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function AdminRidesPage({ accessToken }: AdminRidesPageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminRideStatus | ''>('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<AdminRideListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const fetchRides = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminRides(accessToken, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter || undefined,
        });

        if (isActive) {
          setResult(response);
        }
      } catch (err: unknown) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load rides. Please try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchRides();

    return () => {
      isActive = false;
    };
  }, [accessToken, page, search, statusFilter, refreshKey]);

  const rides = result?.rides ?? [];
  const pagination = result?.pagination;

  const totalRides = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const scheduledOnPage = rides.filter(
    (r) => r.status === 'scheduled' || r.status === 'full',
  ).length;
  const completedOnPage = rides.filter((r) => r.status === 'completed').length;
  const cancelledOnPage = rides.filter((r) => r.status === 'cancelled').length;

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 font-sans lg:p-8">
      <AdminPageHeader
        title="Rides"
        description="Monitor and manage scheduled, active, and completed rides across the Ridezo platform."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminSummaryCard
          title="Total rides"
          value={
            isLoading && !result ? '—' : totalRides.toLocaleString('en-IN')
          }
          description="All platform rides"
          icon={<FiNavigation size={18} />}
          iconClassName="bg-[#C37DF5]/10 text-[#C37DF5]"
        />

        <AdminSummaryCard
          title="Scheduled on page"
          value={isLoading && !result ? '—' : scheduledOnPage}
          description="Upcoming & full departures"
          icon={<FiCalendar size={18} />}
          iconClassName="bg-sky-500/10 text-sky-400"
        />

        <AdminSummaryCard
          title="Completed on page"
          value={isLoading && !result ? '—' : completedOnPage}
          description="Successfully finished rides"
          icon={<FiCheckCircle size={18} />}
          iconClassName="bg-[#34D399]/10 text-[#34D399]"
        />

        <AdminSummaryCard
          title="Cancelled on page"
          value={isLoading && !result ? '—' : cancelledOnPage}
          description="Driver or admin cancelled"
          icon={<FiXCircle size={18} />}
          iconClassName="bg-red-500/10 text-red-400"
        />
      </div>

      {/* Rides Table */}
      <AdminTableContainer
        title="Platform rides"
        description="Inspect route corridors, assigned vehicles, seat occupancy, and ride status."
        actions={
          <>
            <AdminSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearch}
              placeholder="Search origin or destination..."
            />

            <select
              aria-label="Filter by ride status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AdminRideStatus | '');
                setPage(1);
              }}
              className="rounded-xl border border-[#263044] bg-[#080B12] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#C37DF5]/60 focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="full">Full</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {(searchInput || statusFilter) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#A7B0C0] transition hover:border-[#C37DF5]/40 hover:text-[#F8FAFC]"
              >
                Clear
              </button>
            )}
          </>
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#707B8F]">
              {isLoading
                ? 'Loading results...'
                : hasActiveFilters
                  ? `Showing ${rides.length} matching on page ${page} (${totalRides} total)`
                  : totalRides === 0
                    ? 'No rides to display'
                    : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                        (page - 1) * PAGE_SIZE + rides.length,
                        totalRides,
                      )} of ${totalRides} rides`}
            </p>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        }
      >
        {error && (
          <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:mx-6">
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          </div>
        )}

        <table className="w-full min-w-[960px] text-left">
          <thead className="bg-[#06080D]">
            <tr className="border-b border-[#263044] text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
              <th className="px-4 py-3.5 lg:px-6">Ride ID</th>
              <th className="px-4 py-3.5 lg:px-6">Route &amp; Stops</th>
              <th className="px-4 py-3.5 lg:px-6">Driver</th>
              <th className="hidden px-4 py-3.5 sm:table-cell lg:px-6">
                Date &amp; Time
              </th>
              <th className="hidden px-4 py-3.5 lg:table-cell lg:px-6">
                Vehicle
              </th>
              <th className="px-4 py-3.5 lg:px-6">Seats</th>
              <th className="px-4 py-3.5 lg:px-6">Status</th>
              <th className="px-4 py-3.5 text-right lg:px-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#263044]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center">
                  <LoadingState />
                </td>
              </tr>
            ) : !error && rides.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10">
                  <EmptyState
                    title="No rides found"
                    description={
                      hasActiveFilters
                        ? 'No rides match your search or status filter.'
                        : 'There are currently no rides available to display.'
                    }
                    icon={<FiNavigation size={28} />}
                  />
                </td>
              </tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} className="transition hover:bg-white/[0.01]">
                  {/* Ride ID */}
                  <td className="whitespace-nowrap px-4 py-3.5 lg:px-6">
                    <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
                      #{ride.id.slice(-6).toUpperCase()}
                    </span>
                    <p className="mt-0.5 text-[10px] text-[#707B8F]">
                      ₹{ride.pricePerSeat}/seat
                    </p>
                  </td>

                  {/* Route & Stops */}
                  <td className="min-w-0 px-4 py-3.5 lg:px-6">
                    <p className="truncate text-xs font-medium text-[#F8FAFC]">
                      {ride.origin.name} → {ride.destination.name}
                    </p>
                    <span className="mt-1 inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-[#A7B0C0]">
                      {ride.stopsCount > 0
                        ? `+${ride.stopsCount} ${ride.stopsCount === 1 ? 'stop' : 'stops'}`
                        : 'Direct route'}
                    </span>
                  </td>

                  {/* Driver */}
                  <td className="min-w-0 px-4 py-3.5 lg:px-6">
                    {ride.driver ? (
                      <div className="flex min-w-0 items-center gap-2.5">
                        <UserAvatar
                          firstName={ride.driver.firstName}
                          lastName={ride.driver.lastName}
                          profilePhoto={ride.driver.profilePhoto}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#F8FAFC]">
                            {ride.driver.firstName} {ride.driver.lastName}
                          </p>
                          <p className="text-[10px] text-[#707B8F]">
                            ★ {ride.driver.rating.toFixed(1)} ·{' '}
                            {ride.driver.completedRideCount} rides
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#707B8F]">
                        Driver unavailable
                      </span>
                    )}
                  </td>

                  {/* Date & Time */}
                  <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell lg:px-6">
                    <p className="text-xs text-[#F8FAFC]">
                      {formatDate(ride.departureTime)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#707B8F]">
                      {formatTime(ride.departureTime)}
                    </p>
                  </td>

                  {/* Vehicle */}
                  <td className="hidden px-4 py-3.5 lg:table-cell lg:px-6">
                    {ride.vehicle ? (
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[#F8FAFC]">
                          {ride.vehicle.brand} {ride.vehicle.model}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-[#707B8F]">
                          {ride.vehicle.registrationNumber}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-[#707B8F]">—</span>
                    )}
                  </td>

                  {/* Seats */}
                  <td className="whitespace-nowrap px-4 py-3.5 lg:px-6">
                    <p className="text-xs font-medium text-[#F8FAFC]">
                      {ride.bookedSeats}/{ride.totalSeats}{' '}
                      <span className="text-[10px] text-[#707B8F]">
                        {ride.availableSeats === 0 ? 'Full' : 'Booked'}
                      </span>
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: ride.totalSeats }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-1.5 w-3.5 rounded-full ${
                            idx < ride.bookedSeats
                              ? 'bg-[#C37DF5]'
                              : 'bg-[#263044]'
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 lg:px-6">
                    <StatusBadge status={ride.status} />
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-right lg:px-6">
                    <button
                      type="button"
                      onClick={() => setSelectedRideId(ride.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#C37DF5] transition hover:bg-[#C37DF5]/10"
                    >
                      <FiEye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableContainer>

      <AdminRideDetailsModal
        accessToken={accessToken}
        rideId={selectedRideId}
        onClose={() => setSelectedRideId(null)}
        onViewDriver={(driverId) => {
          setSelectedRideId(null);
          navigate(`/admin/users/${driverId}`);
        }}
        onUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
