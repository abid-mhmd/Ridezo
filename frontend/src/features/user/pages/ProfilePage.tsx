import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
  Edit3,
} from 'lucide-react';
import ReviewCard from '../../../components/ReviewCard';
import { getMyProfile } from '../api/profile.api';
import type { UserProfile } from '../types/profile.type';
import UserAvatar from '../../../components/UserAvatar';
import VerificationStatus from '../../../components/VerificationStatus';
import PreferenceItem from '../../../components/PrefrerenceItem';
import RecentRideCard from '../../../components/RecentRideCard';
import IdentityVerificationModal from '../../identity-verification/components/IdentityVerificationModal';
import type { IdentityVerificationInfo } from '../../identity-verification/types/identity-verification.types';

interface RecentRideItem {
  id: string;
  from: string;
  to: string;
  date: string;
  role: 'Driver' | 'Passenger';
  detail: string;
  status: string;
}

function formatShortDate(value?: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function formatStatusLabel(status?: string): string {
  if (!status) return 'Completed';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentRides, setRecentRides] = useState<RecentRideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const user = await getMyProfile();

        if (!isMounted) return;
        setProfile(user);

        setRecentRides([]);
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load your profile.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncVerification = (info: IdentityVerificationInfo) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            idVerified: info.status === 'verified',
            identityVerification: info,
          }
        : prev,
    );
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="h-56 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="h-64 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
            <div className="h-64 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <div className="h-64 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
            <div className="h-48 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="mx-auto max-w-7xl rounded-2xl border border-[#252e3e] bg-[#111722] p-6">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 text-rose-400" size={20} />

          <div>
            <h1 className="font-semibold text-white">
              Couldn't load your profile
            </h1>

            <p className="mt-2 text-sm text-[#929bad]">
              {error ?? 'Your profile information is unavailable.'}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[#8b78ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7965ed]"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || 'Ridezo Traveller';
  const kycStatus =
    profile.identityVerification?.status ??
    (profile.idVerified ? 'verified' : 'not_started');

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <IdentityVerificationModal
        isOpen={isKycModalOpen}
        currentVerification={profile.identityVerification}
        onClose={() => setIsKycModalOpen(false)}
        onVerified={(info) => {
          handleSyncVerification(info);
          setIsKycModalOpen(false);
        }}
        onStatusUpdated={handleSyncVerification}
      />

      {/* Top Banner Profile Header Card */}
      <section className="relative overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <UserAvatar
                firstName={profile.firstName}
                lastName={profile.lastName}
                profilePhoto={profile.profilePhoto}
                size="profile"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {fullName}
                </h1>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-3 py-1 text-xs font-medium text-[#36e0c0]">
                    <BadgeCheck size={13} />
                    {kycStatus === 'verified'
                      ? 'Verified Member'
                      : kycStatus === 'pending'
                        ? 'Verification Pending'
                        : 'Not Verified'}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-[#929bad]">
                {profile.about ||
                  'Usually travelling between Kasaragod and Kochi. Prefer relaxed journeys, clean cars, and punctual pickups along highway corridors.'}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-[#929bad]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#8b78ff]" />
                  {typeof profile.location === 'string'
                    ? profile.location
                    : [profile.location?.city, profile.location?.state]
                        .filter(Boolean)
                        .join(', ') || 'Location not added'}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#8b78ff]" />
                  Member since {formatShortDate(profile.createdAt)}
                </span>

                <span className="flex items-center gap-1.5">
                  <UserRound size={14} className="text-[#8b78ff]" />
                  {profile.languages?.length > 0
                    ? profile.languages.join(', ')
                    : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#8b78ff] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7965ed]"
            >
              <Edit3 size={14} />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Metric Bar Grid inside Banner */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#252e3e] pt-5 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star size={16} className="fill-amber-400" />
              <span className="text-base font-bold text-white">
                {profile.rating || 0}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#929bad]">
              Rating ({profile.reviewCount || 0})
            </p>
          </div>

          <div>
            <p className="text-base font-bold text-white">
              {profile.completedRideCount || 0}
            </p>
            <p className="mt-0.5 text-[11px] text-[#929bad]">
              Completed journeys
            </p>
          </div>

          <div>
            <p className="text-base font-bold text-white">{profile.status}</p>
            <p className="mt-0.5 text-[11px] text-[#929bad]">Profile Status</p>
          </div>

          <div>
            <p className="text-base font-bold text-white">100%</p>
            <p className="mt-0.5 text-[11px] text-[#929bad]">
              Profile verification
            </p>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Ride Participation */}
          <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Ride Participation
              </h2>
              <span className="text-[11px] text-[#929bad]">
                Unified account (Passenger &amp; Driver)
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-[#929bad]">Total Completed Rides</span>
              <span className="rounded-full border border-[#8b78ff]/30 bg-[#8b78ff]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#b6a8ff]">
                Dual Role Active
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {profile.completedRideCount}
              </span>
              <span className="text-xs text-[#929bad]">trips</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentRides.length > 0 ? (
                recentRides.map((ride) => (
                  <RecentRideCard
                    key={ride.id}
                    from={ride.from}
                    to={ride.to}
                    date={ride.date}
                    role={ride.role}
                    detail={ride.detail}
                    status={formatStatusLabel(ride.status)}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4 text-center text-xs text-[#929bad]">
                  No recent journeys found.
                </p>
              )}
            </div>
          </section>

          {/* Traveller Reviews */}
          <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Traveller Reviews
              </h2>
              <span className="text-xs text-[#b6a8ff] cursor-pointer hover:underline">
                View all {profile.reviewCount} →
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <ReviewCard
                initials="RM"
                reviewerName="Rahul M."
                journey="Kasaragod → Kochi (Sep 2026)"
                review="Very punctual and friendly. The trip was comfortable, car was clean, and communication was seamless before the Kasaragod junction pickup."
                rating={5}
              />

              <ReviewCard
                initials="AS"
                reviewerName="Anjali S."
                journey="Kochi → Kasaragod (Aug 2026)"
                review="Smooth pickup and good communication. Arjun was driving calmly and respected quiet travel time when asked."
                rating={5}
              />
            </div>
          </section>
        </div>

        {/* Right Column (Trust & Verification, Preferences, Vehicles) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Trust & Verification */}
          <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5">
            <h2 className="text-sm font-semibold text-white">
              Trust &amp; Verification
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#8b78ff]" />
                  <div>
                    <p className="text-xs font-medium text-white">
                      Email Address
                    </p>
                    <p className="text-[10px] text-[#929bad]">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <VerificationStatus isVerified={profile.emailVerified} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-[#8b78ff]" />
                  <div>
                    <p className="text-xs font-medium text-white">
                      Phone Number
                    </p>
                    <p className="text-[10px] text-[#929bad]">
                      {profile.phone}
                    </p>
                  </div>
                </div>
                <VerificationStatus isVerified={profile.phoneVerified} />
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[#8b78ff]" />
                    <div>
                      <p className="text-xs font-medium text-white">
                        Identity KYC
                      </p>
                      <p className="text-[10px] text-[#929bad]">
                        {profile.identityVerification?.maskedDocumentNumber
                          ? `ID: ${profile.identityVerification.maskedDocumentNumber}`
                          : 'Driving License verification'}
                      </p>
                    </div>
                  </div>
                  <VerificationStatus isVerified={kycStatus === 'verified'} />
                </div>

                {kycStatus !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(true)}
                    className="mt-2.5 w-full cursor-pointer rounded-lg border border-[#8b78ff]/40 bg-[#8b78ff]/10 py-1.5 text-[11px] font-semibold text-[#b6a8ff] transition hover:bg-[#8b78ff]/20"
                  >
                    {kycStatus === 'pending'
                      ? 'View Verification Status'
                      : kycStatus === 'rejected'
                        ? 'Retry Verification'
                        : 'Verify Now'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Travel Preferences */}
          <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Travel Preferences
              </h2>
              <Link
                to="/profile/edit"
                className="text-xs text-[#b6a8ff] cursor-pointer hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <PreferenceItem
                label="Smoking"
                value={profile.preferences?.smoking}
              />

              <PreferenceItem
                label="Pets in cabin"
                value={profile.preferences?.pets}
              />

              <PreferenceItem
                label="Seating comfort"
                value={profile.preferences?.seatingComfort}
              />

              <PreferenceItem
                label="Climate control"
                value={profile.preferences?.climateControl}
              />
            </div>
          </section>

          {/* Registered Vehicles */}
          <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Registered Vehicles
              </h2>
              <Link
                to="/vehicles"
                className="text-xs text-[#b6a8ff] transition hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-white">
                    Hyundai i20 (Asta)
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[#929bad]">
                    KL 14 AB 9821 • Silver Grey
                  </p>
                </div>
                <span className="rounded-full bg-[#36e0c0]/10 px-2 py-0.5 text-[10px] font-medium text-[#36e0c0]">
                  Verified
                </span>
              </div>
              <p className="mt-3 text-[11px] text-[#657086]">
                4 seats available for carpooling
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
