import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiShield,
  FiTruck,
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
import AdminVehicleReviewModal from '../components/AdminVehicleReviewModal';
import { getAdminVehicles } from '../api/admin-vehicle.api';
import type {
  AdminVehicleListResponse,
  AdminVehicleVerificationStatus,
} from '../types/admin-vehicle.types';

interface AdminVehiclesPageProps {
  accessToken: string;
}

const PAGE_SIZE = 10;

export default function AdminVehiclesPage({
  accessToken,
}: AdminVehiclesPageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    AdminVehicleVerificationStatus | ''
  >('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<AdminVehicleListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const fetchVehicles = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminVehicles(accessToken, {
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
              : 'Unable to load vehicles. Please try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchVehicles();

    return () => {
      isActive = false;
    };
  }, [accessToken, page, search, statusFilter, refreshKey]);

  const vehicles = result?.vehicles ?? [];
  const pagination = result?.pagination;

  const totalVehicles = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const pendingOnPage = vehicles.filter(
    (v) => v.verificationStatus === 'pending',
  ).length;
  const approvedOnPage = vehicles.filter(
    (v) => v.verificationStatus === 'approved',
  ).length;
  const rejectedOnPage = vehicles.filter(
    (v) => v.verificationStatus === 'rejected',
  ).length;

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
        title="Vehicles & Verification"
        description="Inspect registered vehicles, review uploaded compliance documents, and manage approval status."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminSummaryCard
          title="Total vehicles"
          value={
            isLoading && !result ? '—' : totalVehicles.toLocaleString('en-IN')
          }
          description="Registered platform vehicles"
          icon={<FiTruck size={18} />}
          iconClassName="bg-[#C37DF5]/10 text-[#C37DF5]"
        />

        <AdminSummaryCard
          title="Pending on page"
          value={isLoading && !result ? '—' : pendingOnPage}
          description="Awaiting admin review"
          icon={<FiClock size={18} />}
          iconClassName="bg-amber-500/10 text-amber-400"
        />

        <AdminSummaryCard
          title="Approved on page"
          value={isLoading && !result ? '—' : approvedOnPage}
          description="Verified for rides"
          icon={<FiCheckCircle size={18} />}
          iconClassName="bg-[#34D399]/10 text-[#34D399]"
        />

        <AdminSummaryCard
          title="Rejected on page"
          value={isLoading && !result ? '—' : rejectedOnPage}
          description="Requires resubmission"
          icon={<FiXCircle size={18} />}
          iconClassName="bg-red-500/10 text-red-400"
        />
      </div>

      {/* Vehicles Table */}
      <AdminTableContainer
        title="Registered vehicles"
        description="Review owner KYC, registration plates, document progress, and verification state."
        actions={
          <>
            <AdminSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearch}
              placeholder="Search registration plate, brand, or model..."
            />

            <select
              aria-label="Filter by verification status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as AdminVehicleVerificationStatus | '',
                );
                setPage(1);
              }}
              className="rounded-xl border border-[#263044] bg-[#080B12] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#C37DF5]/60 focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                  ? `Showing ${vehicles.length} matching on page ${page} (${totalVehicles} total)`
                  : totalVehicles === 0
                    ? 'No vehicles to display'
                    : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                        (page - 1) * PAGE_SIZE + vehicles.length,
                        totalVehicles,
                      )} of ${totalVehicles} vehicles`}
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
              <th className="px-4 py-3.5 lg:px-6">Owner &amp; KYC</th>
              <th className="px-4 py-3.5 lg:px-6">Registration Plate</th>
              <th className="hidden px-4 py-3.5 sm:table-cell lg:px-6">
                Vehicle Type
              </th>
              <th className="px-4 py-3.5 lg:px-6">Documents Status</th>
              <th className="px-4 py-3.5 lg:px-6">Verification Status</th>
              <th className="px-4 py-3.5 text-right lg:px-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#263044]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <LoadingState />
                </td>
              </tr>
            ) : !error && vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10">
                  <EmptyState
                    title="No vehicles found"
                    description={
                      hasActiveFilters
                        ? 'No vehicles match your search or status filter.'
                        : 'There are currently no registered vehicles to display.'
                    }
                    icon={<FiTruck size={28} />}
                  />
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const { total, approved, rejected, pending } =
                  vehicle.documentsSummary;

                return (
                  <tr
                    key={vehicle.id}
                    className="transition hover:bg-white/[0.01]"
                  >
                    {/* Owner & KYC */}
                    <td className="min-w-0 px-4 py-3.5 lg:px-6">
                      {vehicle.owner ? (
                        <div className="flex min-w-0 items-center gap-2.5">
                          <UserAvatar
                            firstName={vehicle.owner.firstName}
                            lastName={vehicle.owner.lastName ?? ''}
                            profilePhoto={vehicle.owner.profilePhoto}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#F8FAFC]">
                              {vehicle.owner.firstName}{' '}
                              {vehicle.owner.lastName ?? ''}
                            </p>

                            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px]">
                              <FiShield
                                size={10}
                                className={
                                  vehicle.owner.emailVerified
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                }
                              />
                              <span
                                className={
                                  vehicle.owner.emailVerified
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                }
                              >
                                {vehicle.owner.emailVerified
                                  ? 'KYC Verified'
                                  : 'Unverified'}
                              </span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#707B8F]">
                          Owner unavailable
                        </span>
                      )}
                    </td>

                    {/* Registration Plate & Model */}
                    <td className="px-4 py-3.5 lg:px-6">
                      <span className="inline-block rounded-md border border-[#263044] bg-[#F8FAFC] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-[#080B12]">
                        {vehicle.registrationNumber}
                      </span>
                      <p className="mt-1 truncate text-[11px] text-[#A7B0C0]">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </p>
                    </td>

                    {/* Vehicle Type */}
                    <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell lg:px-6">
                      <p className="text-xs font-medium capitalize text-[#F8FAFC]">
                        {vehicle.vehicleType}
                      </p>
                      <p className="mt-0.5 text-[10px] capitalize text-[#707B8F]">
                        {vehicle.fuelType} · {vehicle.seatCapacity} seats
                      </p>
                    </td>

                    {/* Documents Status */}
                    <td className="whitespace-nowrap px-4 py-3.5 lg:px-6">
                      {total === 0 ? (
                        <span className="text-xs text-[#707B8F]">
                          No documents
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: total }).map((_, idx) => {
                              let barColor = 'bg-amber-400';
                              if (idx < approved) barColor = 'bg-emerald-400';
                              else if (idx < approved + rejected)
                                barColor = 'bg-red-400';

                              return (
                                <span
                                  key={idx}
                                  className={`h-1.5 w-4 rounded-full ${barColor}`}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-[#A7B0C0]">
                            {approved}/{total} Approved
                            {rejected > 0 && (
                              <span className="text-red-400">
                                {' '}
                                · {rejected} Rejected
                              </span>
                            )}
                            {pending > 0 && rejected === 0 && (
                              <span className="text-amber-400">
                                {' '}
                                · {pending} Pending
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3.5 lg:px-6">
                      <StatusBadge status={vehicle.verificationStatus} />
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right lg:px-6">
                      <button
                        type="button"
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#C37DF5] transition hover:bg-[#C37DF5]/10"
                      >
                        <FiEye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableContainer>

      <AdminVehicleReviewModal
        accessToken={accessToken}
        vehicleId={selectedVehicleId}
        onClose={() => setSelectedVehicleId(null)}
        onViewOwner={(ownerId) => {
          setSelectedVehicleId(null);
          navigate(`/admin/users/${ownerId}`);
        }}
        onUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
