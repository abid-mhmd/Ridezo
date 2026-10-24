import { useCallback, useEffect, useState } from 'react';
import {
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiCheckCircle,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { getAdminUsers } from '../api/admin-users.api';
import type {
  AdminUserListItem,
  AdminUserListResponse,
} from '../types/admin-user.types';

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

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
}

function getStatusStyles(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]';
    case 'suspended':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    case 'deactivated':
      return 'border-red-500/20 bg-red-500/10 text-red-300';
    default:
      return 'border-gray-500/20 bg-gray-500/10 text-gray-300';
  }
}

function UserAvatar({ user }: { user: AdminUserListItem }) {
  if (user.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={`${user.firstName} ${user.lastName}`}
        className="h-9 w-9 shrink-0 rounded-xl border border-[#263044] object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C37DF5]/20 bg-gradient-to-br from-[#C37DF5]/20 to-[#D56BCF]/20 text-xs font-bold text-[#C37DF5]">
      {getInitials(user.firstName, user.lastName)}
    </div>
  );
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<AdminUserListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Debounce search input.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminUsers(accessToken, {
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
      });

      setResult(response);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load users. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, search]);

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
      } catch (error: unknown) {
        if (isActive) {
          setError(
            error instanceof Error
              ? error.message
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
  }, [accessToken, page, search]);

  const users = result?.users ?? [];
  const pagination = result?.pagination;
  const totalUsers = pagination?.total ?? 0;
  const activeUsers = users.filter(
    (user) => user.accountStatus.toLowerCase() === 'active',
  ).length;
  const verifiedEmails = users.filter((user) => user.emailVerified).length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8 font-sans">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Users
          </h1>
          <p className="mt-1 text-xs text-[#A7B0C0]">
            Manage Tripzo accounts, verification status, and user activity
            across Kerala commute networks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#263044] bg-[#111722] px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition hover:border-[#C37DF5]/40 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <FiRefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#263044] bg-[#111722] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#A7B0C0]">Total users</p>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
                {isLoading && !result
                  ? '—'
                  : totalUsers.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] text-[#707B8F]">
                Registered P2P accounts
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C37DF5]/10 text-[#C37DF5]">
              <FiUsers size={18} />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#263044] bg-[#111722] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#A7B0C0]">
                Active users on page
              </p>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
                {isLoading && !result ? '—' : activeUsers}
              </p>
              <p className="mt-1 text-[11px] text-[#707B8F]">
                In good standing
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34D399]/10 text-[#34D399]">
              <FiCheckCircle size={18} />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#263044] bg-[#111722] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#A7B0C0]">
                Verified emails
              </p>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
                {isLoading && !result ? '—' : verifiedEmails}
              </p>
              <p className="mt-1 text-[11px] text-[#707B8F]">
                Email verified accounts
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <FiMail size={18} />
            </span>
          </div>
        </div>
      </div>

      {/* Users table container */}
      <div className="overflow-hidden rounded-2xl border border-[#263044] bg-[#111722] shadow-xl">
        <div className="flex flex-col gap-4 border-b border-[#263044] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-[#F8FAFC]">
              Platform users
            </h2>
            <p className="mt-0.5 text-xs text-[#A7B0C0]">
              Search and review registered accounts.
            </p>
          </div>

          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search users</span>
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#707B8F]">
              <FiSearch size={15} />
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-xl border border-[#263044] bg-[#080B12] py-2 pl-10 pr-3 text-xs text-[#F8FAFC] outline-none transition placeholder:text-[#707B8F] focus:border-[#C37DF5]"
            />
          </label>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:mx-6">
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="mt-2 text-xs font-semibold text-red-200 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#06080D]">
              <tr className="border-b border-[#263044] text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Account status</th>
                <th className="px-6 py-3.5">Email</th>
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
                  <tr
                    key={user.id}
                    className="transition hover:bg-white/[0.01]"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <p className="whitespace-nowrap text-xs font-medium text-[#F8FAFC]">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-0.5 text-[10px] capitalize text-[#707B8F]">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getStatusStyles(
                          user.accountStatus,
                        )}`}
                      >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {user.accountStatus}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="space-y-1">
                        <p className="whitespace-nowrap text-xs text-[#F8FAFC]">
                          {user.email}
                        </p>
                        <VerificationBadge verified={user.emailVerified} />
                      </div>
                    </td>

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

                    <td className="whitespace-nowrap px-6 py-3.5 text-xs text-[#A7B0C0]">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
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
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[#263044] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading || page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={14} />
              Previous
            </button>

            <span className="min-w-16 text-center text-xs text-[#A7B0C0]">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={isLoading || page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
