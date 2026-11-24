import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiLock,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTruck,
  FiUnlock,
  FiX,
} from 'react-icons/fi';

import StatusBadge from '../../components/StatusBadge';
import UserAvatar from '../../../../components/UserAvatar';
import LoadingState from '../../../../components/LoadingState';
import {
  getAdminUserDetails,
  updateAdminUserStatus,
} from '../api/admin-users.api';
import type { AdminUserDetails } from '../types/admin-user.types';

interface AdminUserDetailsModalProps {
  accessToken: string;
  userId: string | null;
  onClose: () => void;
  onUpdated: () => void;
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

export default function AdminUserDetailsModal({
  accessToken,
  userId,
  onClose,
  onUpdated,
}: AdminUserDetailsModalProps) {
  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [retryCount, setRetryCount] = useState(0);

  // Inline confirmation state in footer
  const [confirmAction, setConfirmAction] = useState<
    'active' | 'suspended' | null
  >(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    async function fetchUserDetails() {
      try {
        setIsLoading(true);
        setError('');
        setActionError('');
        setConfirmAction(null);
        const response = await getAdminUserDetails(accessToken, userId!);
        if (isActive) {
          setUser(response.user);
        }
      } catch (err: unknown) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Unable to load user details.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchUserDetails();

    return () => {
      isActive = false;
    };
  }, [accessToken, userId, retryCount]);

  useEffect(() => {
    if (!userId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userId, onClose]);

  if (!userId) return null;

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!user) return;
    setIsSubmittingStatus(true);
    setActionError('');

    try {
      const updatedUser = await updateAdminUserStatus(
        accessToken,
        user.id,
        newStatus,
      );
      setUser((prev) =>
        prev ? { ...prev, accountStatus: updatedUser.accountStatus } : prev,
      );
      setConfirmAction(null);
      onUpdated();
    } catch (err: unknown) {
      setActionError(
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

  const isActiveAccount = user?.accountStatus.toLowerCase() === 'active';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="User details"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#263044] bg-[#0B101B] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#263044] bg-[#080B12] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="truncate text-base font-bold text-[#F8FAFC]">
                {user ? `${user.firstName} ${user.lastName}` : 'User Details'}
              </h2>
              {user && <StatusBadge status={user.accountStatus} />}
              {user && (
                <span className="rounded-full border border-[#C37DF5]/30 bg-[#C37DF5]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C37DF5]">
                  {user.role}
                </span>
              )}
            </div>
            {user && (
              <p className="mt-0.5 font-mono text-[11px] text-[#707B8F]">
                ID: {user.id} · Joined {formatDate(user.createdAt)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#A7B0C0] transition hover:bg-[#111722] hover:text-[#F8FAFC]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="dark-scrollbar flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading && !user ? (
            <div className="py-16 text-center">
              <LoadingState />
            </div>
          ) : error && !user ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
              <p role="alert" className="text-xs text-red-300">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#F8FAFC]"
              >
                <FiRefreshCw size={13} /> Try again
              </button>
            </div>
          ) : user ? (
            <>
              {actionError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <FiAlertCircle size={15} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Profile Summary Card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C37DF5] via-[#D56BCF] to-[#34D399]" />

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      profilePhoto={user.profilePhoto}
                      size="large"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[#F8FAFC]">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#A7B0C0]">
                        {user.email}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-[#A7B0C0]">
                        <span className="flex items-center gap-1.5">
                          <FiMapPin className="text-[#C37DF5]" size={12} />
                          {user.location
                            ? [user.location.city, user.location.state]
                                .filter(Boolean)
                                .join(', ') || 'Not provided'
                            : 'Not provided'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiCalendar className="text-[#C37DF5]" size={12} />
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Rating & Rides */}
                  <div className="flex shrink-0 items-center gap-4 rounded-xl border border-[#263044] bg-[#080B12] px-4 py-3">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-[#707B8F]">
                        Rating
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-base font-bold text-[#F8FAFC]">
                        <FiStar
                          className="fill-amber-400 text-amber-400"
                          size={14}
                        />
                        {user.rating?.toFixed(1) ?? '0.0'}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#263044]" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-[#707B8F]">
                        Rides
                      </p>
                      <p className="mt-1 text-base font-bold text-[#F8FAFC]">
                        {user.completedRideCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric Summary Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#263044] pt-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                    <p className="text-[10px] text-[#707B8F]">
                      Completed Journeys
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#F8FAFC]">
                      {user.completedRideCount ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                    <p className="text-[10px] text-[#707B8F]">
                      Reviews Received
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#F8FAFC]">
                      {user.reviewCount ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                    <p className="text-[10px] text-[#707B8F]">
                      Email Verification
                    </p>
                    <p
                      className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
                        user.emailVerified ? 'text-[#34D399]' : 'text-amber-400'
                      }`}
                    >
                      <FiCheckCircle size={13} />
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                    <p className="text-[10px] text-[#707B8F]">Identity / KYC</p>
                    <p
                      className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
                        user.idVerified ? 'text-[#34D399]' : 'text-amber-400'
                      }`}
                    >
                      <FiCheckCircle size={13} />
                      {user.idVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-[#263044]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative whitespace-nowrap px-4 py-2.5 text-xs font-semibold transition ${
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

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {/* Profile Details */}
                  <div className="space-y-4 rounded-2xl border border-[#263044] bg-[#111722]/70 p-5 lg:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#707B8F]">
                      Profile &amp; Personal Details
                    </h4>

                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[10px] text-[#707B8F]">
                          Full Name
                        </span>
                        <p className="mt-1 font-medium text-[#F8FAFC]">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[10px] text-[#707B8F]">
                          Email Address
                        </span>
                        <p className="mt-1 truncate font-medium text-[#F8FAFC]">
                          {user.email}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[10px] text-[#707B8F]">
                          Phone Number
                        </span>
                        <p className="mt-1 font-medium text-[#F8FAFC]">
                          {user.phone || 'Not provided'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[10px] text-[#707B8F]">
                          Languages
                        </span>
                        <p className="mt-1 font-medium text-[#F8FAFC]">
                          {user.languages?.length
                            ? user.languages.join(', ')
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      <span className="text-[10px] text-[#707B8F]">
                        About / Bio
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-[#A7B0C0]">
                        {user.about || 'No bio provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Compliance & Security */}
                  <div className="space-y-4 rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#707B8F]">
                      Compliance &amp; Security
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[#A7B0C0]">Email</span>
                        <span
                          className={`font-semibold ${
                            user.emailVerified
                              ? 'text-[#34D399]'
                              : 'text-amber-400'
                          }`}
                        >
                          {user.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[#A7B0C0]">Phone</span>
                        <span
                          className={`font-semibold ${
                            user.phoneVerified
                              ? 'text-[#34D399]'
                              : 'text-amber-400'
                          }`}
                        >
                          {user.phoneVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <span className="text-[#A7B0C0]">Identity KYC</span>
                        <span
                          className={`font-semibold ${
                            user.idVerified ? 'text-[#34D399]' : 'text-gray-400'
                          }`}
                        >
                          {user.idVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-[#263044] pt-3 text-[11px] text-[#707B8F]">
                      <p>Created: {formatDate(user.createdAt)}</p>
                      <p>Updated: {formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rides' && (
                <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 py-10 text-center">
                  <FiTruck className="mx-auto text-[#707B8F]" size={28} />
                  <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                    No active rides logged
                  </p>
                  <p className="mt-1 text-xs text-[#A7B0C0]">
                    This user&apos;s completed or scheduled ride history will
                    appear here.
                  </p>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 py-10 text-center">
                  <FiFileText className="mx-auto text-[#707B8F]" size={28} />
                  <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                    No bookings found
                  </p>
                  <p className="mt-1 text-xs text-[#A7B0C0]">
                    Passenger seat reservations will be listed here.
                  </p>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 py-10 text-center">
                  <FiTruck className="mx-auto text-[#707B8F]" size={28} />
                  <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                    No registered vehicles
                  </p>
                  <p className="mt-1 text-xs text-[#A7B0C0]">
                    Vehicles submitted for carpooling compliance will appear
                    here.
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 py-10 text-center">
                  <FiStar className="mx-auto text-[#707B8F]" size={28} />
                  <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                    No reviews received
                  </p>
                  <p className="mt-1 text-xs text-[#A7B0C0]">
                    Co-passenger and driver feedback ratings will be listed
                    here.
                  </p>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 py-10 text-center">
                  <FiShield className="mx-auto text-[#707B8F]" size={28} />
                  <p className="mt-3 text-sm font-medium text-[#F8FAFC]">
                    Clean safety record
                  </p>
                  <p className="mt-1 text-xs text-[#A7B0C0]">
                    No route deviations or incident reports recorded for this
                    account.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer — Suspend / Reactivate with Inline Confirmation */}
        {user && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#263044] bg-[#080B12] px-6 py-4">
            <p className="text-[11px] text-[#707B8F]">
              Last updated {formatDate(user.updatedAt)}
            </p>

            {confirmAction === 'suspended' ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-300">
                  Suspend {user.firstName}&apos;s account?
                </span>
                <button
                  type="button"
                  disabled={isSubmittingStatus}
                  onClick={() => setConfirmAction(null)}
                  className="rounded-xl border border-[#263044] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingStatus}
                  onClick={() => void handleStatusChange('suspended')}
                  className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-semibold text-[#080B12] transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSubmittingStatus ? 'Suspending...' : 'Confirm Suspend'}
                </button>
              </div>
            ) : confirmAction === 'active' ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#34D399]">
                  Reactivate {user.firstName}&apos;s account?
                </span>
                <button
                  type="button"
                  disabled={isSubmittingStatus}
                  onClick={() => setConfirmAction(null)}
                  className="rounded-xl border border-[#263044] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingStatus}
                  onClick={() => void handleStatusChange('active')}
                  className="rounded-xl bg-[#34D399] px-4 py-1.5 text-xs font-semibold text-[#080B12] transition hover:bg-[#2bc2a1] disabled:opacity-50"
                >
                  {isSubmittingStatus
                    ? 'Reactivating...'
                    : 'Confirm Reactivate'}
                </button>
              </div>
            ) : isActiveAccount ? (
              <button
                type="button"
                onClick={() => setConfirmAction('suspended')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                <FiLock size={14} />
                Suspend User
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('active')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 px-4 py-2 text-xs font-semibold text-[#34D399] transition hover:bg-[#34D399]/20"
              >
                <FiUnlock size={14} />
                Reactivate User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
