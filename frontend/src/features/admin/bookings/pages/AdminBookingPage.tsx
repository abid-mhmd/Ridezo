import { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiUsers,
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
import AdminBookingDetailDrawer from '../components/AdminBookingDetailDrawer';
import { getAdminBookings } from '../api/admin-bookings.api';
import type {
  AdminBookingListItem,
  AdminBookingListResponse,
} from '../types/admin-booking.types';

interface AdminBookingsPageProps {
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

export default function AdminBookingsPage({
  accessToken,
}: AdminBookingsPageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminBookingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingListItem | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const fetchBookings = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminBookings(accessToken, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
        });

        if (isActive) {
          setResult(response);
        }
      } catch (err: unknown) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load bookings. Please try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchBookings();

    return () => {
      isActive = false;
    };
  }, [accessToken, page, search]);

  const bookings = result?.bookings ?? [];
  const pagination = result?.pagination;

  const totalBookings = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  // These counts represent only the currently loaded page.
  const pendingBookings = bookings.filter(
    (booking) => booking.status === 'pending',
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === 'accepted',
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === 'completed',
  ).length;

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 font-sans lg:p-8">
      <AdminPageHeader
        title="Bookings"
        description="Monitor and review passenger bookings across the Ridezo platform."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminSummaryCard
          title="Total bookings"
          value={
            isLoading && !result ? '—' : totalBookings.toLocaleString('en-IN')
          }
          description="All platform bookings"
          icon={<FiCalendar size={18} />}
          iconClassName="bg-[#C37DF5]/10 text-[#C37DF5]"
        />

        <AdminSummaryCard
          title="Pending on page"
          value={isLoading && !result ? '—' : pendingBookings}
          description="Awaiting driver response"
          icon={<FiClock size={18} />}
          iconClassName="bg-amber-500/10 text-amber-400"
        />

        <AdminSummaryCard
          title="Accepted on page"
          value={isLoading && !result ? '—' : acceptedBookings}
          description="Confirmed bookings"
          icon={<FiUsers size={18} />}
          iconClassName="bg-sky-500/10 text-sky-400"
        />

        <AdminSummaryCard
          title="Completed on page"
          value={isLoading && !result ? '—' : completedBookings}
          description="Successfully completed"
          icon={<FiCheckCircle size={18} />}
          iconClassName="bg-[#34D399]/10 text-[#34D399]"
        />
      </div>

      {/* Bookings Table */}
      <AdminTableContainer
        title="Platform bookings"
        description="Review passenger requests, ride details, and booking status."
        actions={
          <>
            <AdminSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearch}
              placeholder="Search passenger, driver, or route..."
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
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
                : search
                  ? `Showing ${bookings.length} matching on page ${page} (${totalBookings} total)`
                  : totalBookings === 0
                    ? 'No bookings to display'
                    : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                        (page - 1) * PAGE_SIZE + bookings.length,
                        totalBookings,
                      )} of ${totalBookings} bookings`}
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

        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#06080D]">
            <tr className="border-b border-[#263044] text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
              <th className="px-4 py-3.5 lg:px-6">Passenger</th>
              <th className="hidden px-4 py-3.5 md:table-cell lg:px-6">
                Driver
              </th>
              <th className="px-4 py-3.5 lg:px-6">Route</th>
              <th className="hidden px-4 py-3.5 sm:table-cell lg:px-6">
                Departure
              </th>
              <th className="hidden px-4 py-3.5 lg:table-cell lg:px-6">
                Vehicle
              </th>
              <th className="px-4 py-3.5 lg:px-6">Booking Status</th>
              <th className="px-4 py-3.5 text-right lg:px-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#263044]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <LoadingState />
                </td>
              </tr>
            ) : !error && bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10">
                  <EmptyState
                    title="No bookings found"
                    description={
                      search
                        ? 'No bookings match your search query.'
                        : 'There are currently no bookings available to display.'
                    }
                    icon={<FiCalendar size={28} />}
                  />
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition hover:bg-white/[0.01]"
                >
                  {/* Passenger */}
                  <td className="min-w-0 px-4 py-3.5 lg:px-6">
                    {booking.passenger ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar
                          firstName={booking.passenger.firstName}
                          lastName={booking.passenger.lastName ?? ''}
                          profilePhoto={booking.passenger.profilePhoto}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#F8FAFC]">
                            {booking.passenger.firstName}{' '}
                            {booking.passenger.lastName ?? ''}
                          </p>

                          <p className="truncate text-[10px] text-[#707B8F]">
                            {booking.passenger.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#707B8F]">
                        Passenger unavailable
                      </span>
                    )}
                  </td>

                  {/* Driver */}
                  <td className="hidden px-4 py-3.5 md:table-cell lg:px-6">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar
                        firstName={booking.driver.firstName}
                        lastName={booking.driver.lastName}
                        profilePhoto={booking.driver.profilePhoto}
                      />

                      <p className="truncate text-xs font-medium text-[#F8FAFC]">
                        {booking.driver.firstName} {booking.driver.lastName}
                      </p>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="min-w-0 px-4 py-3.5 lg:px-6">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-xs font-medium text-[#F8FAFC]">
                        {booking.ride.origin.name}
                      </p>

                      <p className="text-[10px] text-[#707B8F]">to</p>

                      <p className="truncate text-xs font-medium text-[#A7B0C0]">
                        {booking.ride.destination.name}
                      </p>
                    </div>
                  </td>

                  {/* Departure */}
                  <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell lg:px-6">
                    <p className="text-xs text-[#F8FAFC]">
                      {formatDate(booking.ride.departureTime)}
                    </p>

                    <p className="mt-1 text-[10px] text-[#707B8F]">
                      {formatTime(booking.ride.departureTime)}
                    </p>
                  </td>

                  {/* Vehicle */}
                  <td className="hidden px-4 py-3.5 lg:table-cell lg:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#F8FAFC]">
                        {booking.vehicle.brand} {booking.vehicle.model}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-[#707B8F]">
                        {booking.vehicle.registrationNumber}
                      </p>
                    </div>
                  </td>

                  {/* Booking Status */}
                  <td className="px-4 py-3.5 lg:px-6">
                    <StatusBadge status={booking.status} />
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-right lg:px-6">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
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
      <AdminBookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onViewUser={(userId) => {
          setSelectedBooking(null);
          navigate(`/admin/users/${userId}`);
        }}
      />
    </div>
  );
}
