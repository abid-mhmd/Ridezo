import { useEffect, useState } from 'react';
import { FiUsers, FiCheckCircle, FiMail, FiEye } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import AdminSummaryCard from '../../components/common/AdminSummaryCard';
import AdminSearchBar from '../../components/common/AdminSearchBar';
import AdminTableContainer from '../../components/common/AdminTableContainer';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../../../components/layout/Pagination';
import UserAvatar from '../../../../components/UserAvatar';
import AdminUserDetailsModal from '../components/AdminUserDetailsModal';
import { getAdminUsers } from '../api/admin-users.api';
import type { AdminUserListResponse } from '../types/admin-user.types';

interface AdminUsersPageProps {
  accessToken: string;
}

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        verified
          ? 'bg-[#34D399]/10 text-[#34D399]'
          : 'bg-gray-500/10 text-gray-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          verified ? 'bg-[#34D399]' : 'bg-gray-500'
        }`}
      />

      {verified ? 'Verified' : 'Pending'}
    </span>
  );
}

export default function AdminUsersPage({ accessToken }: AdminUsersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(() =>
    searchParams.get('userId'),
  );

  const [result, setResult] = useState<AdminUserListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const queryUserId = searchParams.get('userId');
    if (queryUserId) {
      setSelectedUserId(queryUserId);
    }
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminUsers(accessToken, {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
        });

        if (isActive) {
          setResult(response);
        }
      } catch (err: unknown) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load users. Please try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isActive = false;
    };
  }, [accessToken, page, search, refreshKey]);

  const users = result?.users ?? [];
  const pagination = result?.pagination;

  const totalUsers = pagination?.total ?? 0;

  const activeUsers = users.filter(
    (user) => user.accountStatus.toLowerCase() === 'active',
  ).length;

  const verifiedEmails = users.filter((user) => user.emailVerified).length;

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleCloseModal = () => {
    setSelectedUserId(null);
    if (searchParams.has('userId')) {
      const next = new URLSearchParams(searchParams);
      next.delete('userId');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 font-sans lg:p-8">
      <AdminPageHeader
        title="Users"
        description="Manage Ridezo accounts, verification status, and user activity across Kerala commute networks."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminSummaryCard
          title="Total users"
          value={
            isLoading && !result ? '—' : totalUsers.toLocaleString('en-IN')
          }
          description="Registered P2P accounts"
          icon={<FiUsers size={18} />}
          iconClassName="bg-[#C37DF5]/10 text-[#C37DF5]"
        />

        <AdminSummaryCard
          title="Active users on page"
          value={isLoading && !result ? '—' : activeUsers}
          description="In good standing"
          icon={<FiCheckCircle size={18} />}
          iconClassName="bg-[#34D399]/10 text-[#34D399]"
        />

        <AdminSummaryCard
          title="Verified emails"
          value={isLoading && !result ? '—' : verifiedEmails}
          description="Email verified accounts"
          icon={<FiMail size={18} />}
          iconClassName="bg-sky-500/10 text-sky-400"
        />
      </div>

      {/* Users table */}
      <AdminTableContainer
        title="Platform users"
        description="Search and review registered accounts."
        actions={
          <>
            <AdminSearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearch}
              placeholder="Search by name, email, or phone..."
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
                : totalUsers === 0
                  ? 'No users to display'
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                      (page - 1) * PAGE_SIZE + users.length,
                      totalUsers,
                    )} of ${totalUsers} users`}
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
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Account status</th>
              <th className="px-6 py-3.5">Identity Verification</th>
              <th className="px-6 py-3.5">Phone</th>
              <th className="px-6 py-3.5">Joined</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#263044]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <div className="inline-flex items-center gap-3 text-xs text-[#A7B0C0]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C37DF5]/30 border-t-[#C37DF5]" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : !error && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <p className="text-xs font-medium text-[#F8FAFC]">
                    No users found
                  </p>

                  <p className="mt-1 text-[11px] text-[#A7B0C0]">
                    Try another search query or filter.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="transition hover:bg-white/[0.01]">
                  {/* User */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        profilePhoto={user.profilePhoto}
                      />

                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-xs font-medium text-[#F8FAFC]">
                          {user.firstName} {user.lastName}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-[#707B8F]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Account status */}
                  <td className="px-6 py-3.5">
                    <StatusBadge status={user.accountStatus} />
                  </td>

                  {/* Identity Verification */}
                  <td className="px-6 py-3.5">
                    <StatusBadge
                      status={user.idVerified ? 'verified' : 'pending'}
                    />
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-3.5">
                    <div className="space-y-1">
                      <p className="whitespace-nowrap text-xs text-[#F8FAFC]">
                        {user.phone || '—'}
                      </p>

                      {user.phone ? (
                        <VerificationBadge verified={user.phoneVerified} />
                      ) : (
                        <span className="text-[10px] text-[#707B8F]">
                          Not provided
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="whitespace-nowrap px-6 py-3.5 text-xs text-[#A7B0C0]">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
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

      <AdminUserDetailsModal
        accessToken={accessToken}
        userId={selectedUserId}
        onClose={handleCloseModal}
        onUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
