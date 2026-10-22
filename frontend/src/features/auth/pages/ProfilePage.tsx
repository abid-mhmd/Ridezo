import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
  Edit3,
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
    `${profile.firstName} ${profile.lastName}`.trim() || 'Tripzo Traveller';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Banner Profile Header Card */}
      <section className="relative overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar with status badge */}
            <div className="relative">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={fullName}
                  className="h-24 w-24 shrink-0 rounded-2xl border border-[#30394b] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#30394b] bg-[#1b2030] text-3xl font-semibold text-[#b6a8ff]">
                  {profile.firstName?.charAt(0).toUpperCase() || 'T'}
                </div>
              )}
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#111722] bg-[#36e0c0] text-[10px] text-[#080b12]">
                ✓
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {fullName}
                </h1>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-3 py-1 text-xs font-medium text-[#36e0c0]">
                    <BadgeCheck size={13} />
                    {profile.idVerified ? 'Verified Member' : 'Not Verifed'}
                  </span>

                  {/* <span className="inline-flex items-center rounded-full border border-[#8b78ff]/30 bg-[#8b78ff]/10 px-3 py-1 text-xs font-medium text-[#b6a8ff]">
                    P2P Traveller
                  </span> */}
                </div>
              </div>

              <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-[#929bad]">
                {profile.about ||
                  'Usually travelling between Kasaragod and Kochi. Prefer relaxed journeys, clean cars, and punctual pickups along highway corridors.'}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-[#929bad]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#8b78ff]" />
                  {profile.location || 'Kasaragod, Kerala'}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#8b78ff]" />
                  Member since Feb 2026
                </span>

                <span className="flex items-center gap-1.5">
                  <UserRound size={14} className="text-[#8b78ff]" />
                  {profile.languages?.length > 0
                    ? profile.languages.join(', ')
                    : 'Malayalam, English, Hindi'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-[#8b78ff] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7965ed]"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>

            {/* <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[#30394b] bg-[#161b27] px-4 py-2.5 text-xs font-medium text-[#c7cddd] transition hover:bg-[#202838] hover:text-white"
            >
              <Share2 size={14} />
              Share
            </button> */}
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
        {/* Left Column (Ride Participation & Reviews) */}
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

            {/* Progress ratio bar */}
            {/* <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1b2030]">
              <div className="flex h-full w-full">
                <div
                  className="bg-[#8b78ff] transition-all"
                  style={{ width: '73%' }}
                />
                <div
                  className="bg-[#36e0c0] transition-all"
                  style={{ width: '27%' }}
                />
              </div>
            </div> */}

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#929bad]">
                <span className="h-2 w-2 rounded-full bg-[#8b78ff]" /> As
                passenger (94)
              </span>
              <span className="flex items-center gap-1.5 text-[#929bad]">
                <span className="h-2 w-2 rounded-full bg-[#36e0c0]" /> As driver
                (34)
              </span>
            </div>

            {/* Recent Journeys sub-section */}
            <div className="mt-6 border-t border-[#252e3e] pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white">
                  Recent journeys
                </h3>
                <Link
                  to="/my-rides"
                  className="text-xs text-[#b6a8ff] transition hover:underline"
                >
                  View My Rides →
                </Link>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b78ff]/10 text-[#8b78ff]">
                      🚗
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        Kasaragod <span className="text-[#8b78ff]">→</span>{' '}
                        Kochi
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#929bad]">
                        Oct 1, 2026 · Passenger · ₹350
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-1 text-[10px] font-medium text-[#36e0c0]">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#36e0c0]/10 text-[#36e0c0]">
                      🚙
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        Kochi <span className="text-[#36e0c0]">→</span>{' '}
                        Kasaragod
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#929bad]">
                        Sep 28, 2026 · Driver · 3 passengers
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-1 text-[10px] font-medium text-[#36e0c0]">
                    Completed
                  </span>
                </div>
              </div>
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
              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b2030] text-xs font-semibold text-[#b6a8ff]">
                      RM
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">Rahul M.</p>
                      <p className="text-[10px] text-[#929bad]">
                        Kasaragod → Kochi (Sep 2026)
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#c7cddd]">
                  "Very punctual and friendly. The trip was comfortable, car was
                  clean, and communication was seamless before the Kasaragod
                  junction pickup."
                </p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b2030] text-xs font-semibold text-[#b6a8ff]">
                      AS
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        Anjali S.
                      </p>
                      <p className="text-[10px] text-[#929bad]">
                        Kochi → Kasaragod (Aug 2026)
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#c7cddd]">
                  "Smooth pickup and good communication. Arjun was driving
                  calmly and respected quiet travel time when asked."
                </p>
              </div>
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
                {profile.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#36e0c0]">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                    <CircleAlert size={13} /> Not verified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-[#8b78ff]" />
                  <div>
                    <p className="text-xs font-medium text-white">
                      Phone Number
                    </p>
                    <p className="text-[10px] text-[#929bad]">
                      {profile.phone}+91 98•••••21
                    </p>
                  </div>
                </div>
                {profile.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#36e0c0]">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                    <CircleAlert size={13} /> Not verified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-[#8b78ff]" />
                  <div>
                    <p className="text-xs font-medium text-white">
                      Govt. ID Document
                    </p>
                    <p className="text-[10px] text-[#929bad]">
                      Aadhaar Card Linked
                    </p>
                  </div>
                </div>
                {profile.idVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#36e0c0]">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                    <CircleAlert size={13} /> Not verified
                  </span>
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
              <span className="text-xs text-[#b6a8ff] cursor-pointer hover:underline">
                Edit
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#252e3e] pb-2.5">
                <span className="text-[#929bad]">Smoking</span>
                <span className="rounded-full bg-[#161b27] px-2.5 py-1 text-[11px] text-white border border-[#30394b]">
                  {profile.preferences?.smoking}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#252e3e] pb-2.5">
                <span className="text-[#929bad]">Pets in cabin</span>
                <span className="rounded-full bg-[#161b27] px-2.5 py-1 text-[11px] text-white border border-[#30394b]">
                  {profile.preferences?.pets}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#252e3e] pb-2.5">
                <span className="text-[#929bad]">Seating comfort</span>
                <span className="rounded-full bg-[#161b27] px-2.5 py-1 text-[11px] text-white border border-[#30394b]">
                  {profile.preferences?.seatingComfort}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#929bad]">Climate control</span>

                <span className="rounded-full border border-[#30394b] bg-[#161b27] px-2.5 py-1 text-[11px] text-white">
                  {profile.preferences?.climateControl === 'ac-preferred'
                    ? 'AC Preferred'
                    : profile.preferences?.climateControl === 'non-ac-preferred'
                      ? 'Non-AC Preferred'
                      : 'No preference'}
                </span>
              </div>
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
