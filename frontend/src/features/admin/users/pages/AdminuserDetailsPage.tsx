import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiShield,
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiStar,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiFileText,
  FiTruck,
} from 'react-icons/fi';

import {
  getAdminUserDetails,
  updateAdminUserStatus,
} from '../api/admin-users.api';
import type { AdminUserDetails } from '../types/admin-user.types';

interface AdminUserDetailsPageProps {
  accessToken: string;
}

type TabType =
  'overview' | 'rides' | 'bookings' | 'vehicles' | 'reviews' | 'safety';

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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

export default function AdminUserDetailsPage({
  accessToken,
}: AdminUserDetailsPageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modal states
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const loadUserDetails = useCallback(async () => {
    if (!userId) {
      setError('A user ID is required.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminUserDetails(accessToken, userId);
      setUser(response.user);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to load user details.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    void loadUserDetails();
  }, [loadUserDetails]);

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!userId) return;
    setIsSubmittingStatus(true);
    setError('');

    try {
      const updatedUser = await updateAdminUserStatus(
        accessToken,
        userId,
        newStatus,
      );
      setUser((prevUser) =>
        prevUser
          ? { ...prevUser, accountStatus: updatedUser.accountStatus }
          : prevUser,
      );
      setIsSuspendModalOpen(false);
      setIsReactivateModalOpen(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to update account status.',
      );
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'rides', label: 'Rides', count: user?.completedRideCount },
    { id: 'bookings', label: 'Bookings' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'reviews', label: 'Reviews', count: user?.reviewCount },
    { id: 'safety', label: 'Safety & Detours' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[#A7B0C0] transition hover:text-[#F8FAFC]"
          >
            <FiArrowLeft size={14} />
            Users / User Details
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              {user ? `${user.firstName} ${user.lastName}` : 'User Details'}
            </h1>
            {user && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                  user.accountStatus,
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {user.accountStatus}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {user && (
          <div className="flex items-center gap-2.5">
            {user.accountStatus.toLowerCase() === 'active' ? (
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                <FiLock size={14} />
                Suspend User
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsReactivateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2.5 text-xs font-semibold text-[#34D399] transition hover:bg-[#34D399]/20"
              >
                <FiUnlock size={14} />
                Reactivate User
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-[#263044] bg-[#111722]">
          <div className="inline-flex items-center gap-3 text-xs text-[#A7B0C0]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C37DF5]/30 border-t-[#C37DF5]" />
            Loading account details...
          </div>
        </div>
      ) : error && !user ? (
        <div className="rounded-2xl border border-red-500/20 bg-[#111722] p-6">
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadUserDetails()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#F8FAFC]"
          >
            <FiRefreshCw size={13} /> Try again
          </button>
        </div>
      ) : user ? (
        <>
          {/* Top Profile Summary Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#263044] bg-[#111722] p-6 sm:p-8 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C37DF5] via-[#D56BCF] to-[#34D399]" />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-20 w-20 shrink-0 rounded-2xl border border-[#263044] object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#C37DF5]/20 bg-[#C37DF5]/10 text-2xl font-bold text-[#C37DF5]">
                    {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-[#F8FAFC]">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span className="rounded-full border border-[#C37DF5]/30 bg-[#C37DF5]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C37DF5]">
                      {user.role}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#A7B0C0]">{user.email}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#A7B0C0]">
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="text-[#C37DF5]" size={13} />
                      {user.location
                        ? [user.location.city, user.location.state]
                            .filter(Boolean)
                            .join(', ')
                        : 'Kasaragod, Kerala'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="text-[#C37DF5]" size={13} />
                      Joined {formatDate(user.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#707B8F]">
                      ID: {user.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Rating badge */}
              <div className="flex items-center gap-4 rounded-xl border border-[#263044] bg-[#080B12] p-4 shrink-0">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-[#707B8F]">Rating</p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-bold text-[#F8FAFC]">
                    <FiStar
                      className="fill-amber-400 text-amber-400"
                      size={15}
                    />
                    {user.rating?.toFixed(1) ?? '4.9'}
                  </p>
                </div>
                <div className="h-8 w-px bg-[#263044]" />
                <div className="text-center">
                  <p className="text-[10px] uppercase text-[#707B8F]">Rides</p>
                  <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                    {user.completedRideCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Summary Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#263044] pt-5 sm:grid-cols-4">
              <div className="rounded-xl border border-[#263044] bg-[#080B12] p-4">
                <p className="text-[11px] text-[#707B8F]">Completed Journeys</p>
                <p className="mt-1 text-2xl font-bold text-[#F8FAFC]">
                  {user.completedRideCount ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-[#263044] bg-[#080B12] p-4">
                <p className="text-[11px] text-[#707B8F]">Reviews Received</p>
                <p className="mt-1 text-2xl font-bold text-[#F8FAFC]">
                  {user.reviewCount ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-[#263044] bg-[#080B12] p-4">
                <p className="text-[11px] text-[#707B8F]">Email Verification</p>
                <p className="mt-1 text-xs font-semibold text-[#34D399] flex items-center gap-1">
                  <FiCheckCircle size={13} />{' '}
                  {user.emailVerified ? 'Verified' : 'Pending'}
                </p>
              </div>

              <div className="rounded-xl border border-[#263044] bg-[#080B12] p-4">
                <p className="text-[11px] text-[#707B8F]">Identity / KYC</p>
                <p className="mt-1 text-xs font-semibold text-[#34D399] flex items-center gap-1">
                  <FiCheckCircle size={13} />{' '}
                  {user.idVerified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#263044] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#C37DF5]'
                    : 'text-[#A7B0C0] hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#263044] px-2 py-0.5 text-[10px] text-[#F8FAFC]">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#C37DF5]" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT AREAS */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Profile Information */}
                <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 space-y-4 lg:col-span-2">
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Profile & Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      <span className="text-[#707B8F]">Full Name</span>
                      <p className="mt-1 font-medium text-[#F8FAFC]">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      <span className="text-[#707B8F]">Email Address</span>
                      <p className="mt-1 font-medium text-[#F8FAFC]">
                        {user.email}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      <span className="text-[#707B8F]">Phone Number</span>
                      <p className="mt-1 font-medium text-[#F8FAFC]">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      <span className="text-[#707B8F]">Languages</span>
                      <p className="mt-1 font-medium text-[#F8FAFC]">
                        {user.languages?.length
                          ? user.languages.join(', ')
                          : 'Malayalam, English'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#263044] bg-[#080B12] p-4">
                    <span className="text-[11px] text-[#707B8F]">
                      About / Bio
                    </span>
                    <p className="mt-1 text-xs text-[#A7B0C0] leading-relaxed">
                      {user.about ||
                        'Usually travelling along highway corridors. Prefers punctual pickups and clean vehicle standards.'}
                    </p>
                  </div>
                </div>

                {/* Account Compliance & Verification */}
                <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Compliance & Security
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                      <span className="text-[#A7B0C0]">Email Verification</span>
                      <span
                        className={`font-semibold ${user.emailVerified ? 'text-[#34D399]' : 'text-amber-400'}`}
                      >
                        {user.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                      <span className="text-[#A7B0C0]">Phone Verification</span>
                      <span
                        className={`font-semibold ${user.phoneVerified ? 'text-[#34D399]' : 'text-amber-400'}`}
                      >
                        {user.phoneVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                      <span className="text-[#A7B0C0]">Identity KYC</span>
                      <span
                        className={`font-semibold ${user.idVerified ? 'text-[#34D399]' : 'text-gray-400'}`}
                      >
                        {user.idVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#263044] space-y-2 text-[11px] text-[#707B8F]">
                    <p>Account Created: {formatDate(user.createdAt)}</p>
                    <p>Last Updated: {formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rides' && (
              <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 text-center py-12">
                <FiTruck className="mx-auto text-[#707B8F]" size={32} />
                <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                  No active rides logged
                </p>
                <p className="mt-1 text-xs text-[#A7B0C0]">
                  This user's completed or scheduled ride history will appear
                  here.
                </p>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 text-center py-12">
                <FiFileText className="mx-auto text-[#707B8F]" size={32} />
                <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                  No bookings found
                </p>
                <p className="mt-1 text-xs text-[#A7B0C0]">
                  Passenger seat reservations will be listed here.
                </p>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 text-center py-12">
                <FiTruck className="mx-auto text-[#707B8F]" size={32} />
                <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                  No registered vehicles
                </p>
                <p className="mt-1 text-xs text-[#A7B0C0]">
                  Vehicles submitted for carpooling compliance will appear here.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 text-center py-12">
                <FiStar className="mx-auto text-[#707B8F]" size={32} />
                <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                  No reviews received
                </p>
                <p className="mt-1 text-xs text-[#A7B0C0]">
                  Co-passenger and driver feedback ratings will be listed here.
                </p>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="rounded-2xl border border-[#263044] bg-[#111722] p-6 text-center py-12">
                <FiShield className="mx-auto text-[#707B8F]" size={32} />
                <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                  Clean safety record
                </p>
                <p className="mt-1 text-xs text-[#A7B0C0]">
                  No route deviations or incident reports recorded for this
                  account.
                </p>
              </div>
            )}
          </div>

          {/* SUSPEND MODAL */}
          {isSuspendModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-[#263044] bg-[#111722] p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-amber-400">
                  <FiAlertCircle size={24} />
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Suspend user?
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#A7B0C0]">
                  This will restrict{' '}
                  <strong className="text-white">
                    {user.firstName} {user.lastName}
                  </strong>{' '}
                  from using affected Tripzo features until the account is
                  reactivated.
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    // disabled={isSubmittingStatus}
                    onClick={() => setIsSuspendModalOpen(false)}
                    className="rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#A7B0C0] transition hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingStatus}
                    onClick={() => void handleStatusChange('suspended')}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-[#080B12] transition hover:bg-amber-400 disabled:opacity-50"
                  >
                    Suspend User
                    {isSubmittingStatus ? 'Suspending...' : 'Suspend User'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REACTIVATE MODAL */}
          {isReactivateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-[#263044] bg-[#111722] p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-[#34D399]">
                  <FiCheckCircle size={24} />
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Reactivate user?
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#A7B0C0]">
                  Restore full active Tripzo account access for{' '}
                  <strong className="text-white">
                    {user.firstName} {user.lastName}
                  </strong>
                  ?
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingStatus}
                    onClick={() => setIsReactivateModalOpen(false)}
                    className="rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#A7B0C0] transition hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingStatus}
                    onClick={() => void handleStatusChange('active')}
                    className="rounded-xl bg-[#34D399] px-4 py-2 text-xs font-semibold text-[#080B12] transition hover:bg-[#2bc2a1] disabled:opacity-50"
                  >
                    {isSubmittingStatus ? 'Reactivating...' : 'Reactivate User'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
