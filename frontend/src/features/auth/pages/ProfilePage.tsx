import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CarFront,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { getMyProfile } from '../api/profile.api';
import type { UserProfile } from '../types/profile.type';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const user = await getMyProfile();

        if (isMounted) {
          setProfile(user);
        }
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

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#161b27]" />
        <div className="h-56 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="mx-auto max-w-6xl rounded-2xl border border-[#252e3e] bg-[#111722] p-6">
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
              className="mt-4 rounded-lg bg-[#8b78ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7965ed]"
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

  const verificationItems = [
    {
      label: 'Email address',
      verified: profile.emailVerified,
      icon: Mail,
    },
    {
      label: 'Phone number',
      verified: profile.phoneVerified,
      icon: Phone,
    },
    {
      label: 'Identity',
      verified: profile.idVerified,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b78ff]">
          Account
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-[#929bad]">
          Manage your personal information and account verification.
        </p>
      </div>

      {/* Profile overview */}
      <section className="relative overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

        <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center">
          {/* Avatar */}
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={fullName}
              className="h-24 w-24 shrink-0 rounded-2xl border border-[#30394b] object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#30394b] bg-[#1b2030] text-3xl font-semibold text-[#b6a8ff]">
              {profile.firstName?.charAt(0).toUpperCase() || 'R'}
            </div>
          )}

          {/* User information */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white">{fullName}</h2>

              {profile.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#36e0c0]/20 bg-[#36e0c0]/10 px-2.5 py-1 text-xs text-[#36e0c0]">
                  <BadgeCheck size={14} />
                  Verified
                </span>
              )}
            </div>

            <p className="mt-2 break-all text-sm text-[#929bad]">
              {profile.email}
            </p>

            {profile.location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-[#929bad]">
                <MapPin size={15} />
                {profile.location}
              </p>
            )}

            {profile.about && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c7cddd]">
                {profile.about}
              </p>
            )}
          </div>

          {/* Edit action */}
          <button
            type="button"
            disabled
            title="Profile editing will be implemented next."
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#30394b] px-4 py-2.5 text-sm font-medium text-[#929bad] opacity-70"
          >
            <UserRound size={16} />
            Edit profile
          </button>
        </div>
      </section>

      {/* Account statistics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={CarFront}
          label="Completed rides"
          value={String(profile.completedRideCount)}
          description="Your completed journeys"
        />

        <StatCard
          icon={ShieldCheck}
          label="Identity verification"
          value={profile.idVerified ? 'Verified' : 'Pending'}
          description="Your identity verification status"
        />

        <StatCard
          icon={CalendarDays}
          label="Account role"
          value={profile.role}
          description="Your current account role"
        />
      </section>

      {/* Verification status */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">
            Account verification
          </h2>

          <p className="mt-1 text-sm text-[#929bad]">
            Keep your information verified to build trust with other travellers.
          </p>
        </div>

        <div className="divide-y divide-[#252e3e]">
          {verificationItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b2030] text-[#b6a8ff]">
                    <Icon size={18} />
                  </div>

                  <span className="text-sm text-[#c7cddd]">{item.label}</span>
                </div>

                <span
                  className={[
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
                    item.verified
                      ? 'bg-[#36e0c0]/10 text-[#36e0c0]'
                      : 'bg-amber-400/10 text-amber-300',
                  ].join(' ')}
                >
                  {item.verified ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Clock3 size={13} />
                  )}

                  {item.verified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Languages */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Languages</h2>

        <p className="mt-1 text-sm text-[#929bad]">
          Languages listed on your profile.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {profile.languages.length > 0 ? (
            profile.languages.map((language) => (
              <span
                key={language}
                className="rounded-full border border-[#30394b] bg-[#161b27] px-3 py-1.5 text-xs text-[#c7cddd]"
              >
                {language}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#929bad]">No languages added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: typeof CarFront;
  label: string;
  value: string;
  description: string;
}

function StatCard({ icon: Icon, label, value, description }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 transition-colors hover:border-[#8b78ff]/40">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#929bad]">{label}</p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b78ff]/10 text-[#b6a8ff]">
          <Icon size={17} />
        </span>
      </div>

      <p className="mt-4 break-words text-xl font-semibold capitalize text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#657086]">{description}</p>
    </article>
  );
}
