import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search,
  CarFront,
  ListChecks,
  ArrowRight,
  ShieldCheck,
  MapPin,
  IndianRupee,
  RefreshCw,
  Zap,
  CalendarDays,
} from 'lucide-react';

import RideSearchForm from '../components/RideSearchForm';
import type { RideSearchFormValues } from '../components/RideSearchForm';
import { getMyRides } from '../api/ride.api';
import type { Ride } from '../types/ride.types';
import type { AuthUser } from '../../auth/types/auth.types';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: AuthUser }>();

  const [upcomingRide, setUpcomingRide] = useState<Ride | null>(null);
  const [isLoadingRide, setIsLoadingRide] = useState(true);
  const [rideError, setRideError] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';

  // Fetch upcoming ride
  useEffect(() => {
    let isActive = true;

    const fetchUpcomingRide = async () => {
      try {
        setIsLoadingRide(true);
        setRideError(false);

        const result = await getMyRides(1, 10);
        if (!isActive) return;

        const now = Date.now();

        const nextRide = result.rides
          .filter(
            (ride) =>
              ride.status === 'scheduled' &&
              new Date(ride.departureTime).getTime() > now,
          )
          .sort(
            (a, b) =>
              new Date(a.departureTime).getTime() -
              new Date(b.departureTime).getTime(),
          )[0];

        setUpcomingRide(nextRide ?? null);
      } catch {
        if (isActive) {
          setRideError(true);
          setUpcomingRide(null);
        }
      } finally {
        if (isActive) setIsLoadingRide(false);
      }
    };

    void fetchUpcomingRide();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSearch = (values: RideSearchFormValues) => {
    navigate('/rides/search', { state: { search: values } });
  };

  const scrollToSearch = () => {
    document
      .getElementById('ride-search')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickActions = [
    {
      label: 'Find a Ride',
      description: 'Search available journeys.',
      icon: Search,
      color: 'text-[#36e0c0]',
      action: scrollToSearch,
    },
    {
      label: 'Offer a Ride',
      description: 'Share your available seats.',
      icon: CarFront,
      color: 'text-[#8b78ff]',
      action: () => navigate('/rides/create'),
    },
    {
      label: 'My Rides',
      description: 'Manage your created rides.',
      icon: ListChecks,
      color: 'text-[#f0b45b]',
      action: () => navigate('/my-rides'),
    },
  ];

  const trustBadges = [
    {
      label: 'Identity Verification',
      description: 'Verification feature',
      icon: ShieldCheck,
      color: 'text-[#36e0c0]',
    },
    {
      label: 'Payment Protection',
      description: 'Payment feature',
      icon: IndianRupee,
      color: 'text-[#8b78ff]',
    },
    {
      label: 'Live GPS Tracking',
      description: 'Tracking feature',
      icon: MapPin,
      color: 'text-[#36e0c0]',
    },
    {
      label: 'Vehicle Verification',
      description: 'Verification feature',
      icon: CarFront,
      color: 'text-[#8b78ff]',
    },
  ];

  const departureDate = upcomingRide
    ? new Date(upcomingRide.departureTime)
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 font-sans text-gray-100">
      {/* Welcome / Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#252e3e] bg-[#111722] p-6 shadow-2xl sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-3.5 py-1.5 text-xs font-medium text-[#36e0c0]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#36e0c0]" />
              RIDEZO · PEER-TO-PEER CARPOOLING
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {greeting}, {user.firstName}.
              <br />
              <span className="bg-gradient-to-r from-[#8b78ff] via-[#c084fc] to-[#36e0c0] bg-clip-text text-transparent">
                Where are you heading next?
              </span>
            </h1>

            <p className="max-w-xl text-xs leading-relaxed text-[#929bad] sm:text-sm">
              Find trusted travel companions going your way, or share your empty
              seats to split highway fuel and toll costs across Kerala's coastal
              network.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToSearch}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#8b78ff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-[#7964f5]"
              >
                <Search size={14} />
                Find a Ride
              </button>

              <button
                type="button"
                onClick={() => navigate('/rides/create')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#30394b] bg-[#161b27] px-4 py-2.5 text-xs font-medium text-[#c7cddd] transition hover:bg-[#202838] hover:text-white"
              >
                <CarFront size={14} className="text-[#36e0c0]" />
                Offer a Ride
              </button>
            </div>
          </div>

          {/* Upcoming Ride Preview */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#080b12] shadow-2xl">
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
                  alt="Carpool road trip"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-transparent" />
              </div>

              <div className="flex items-center justify-between p-3.5">
                {isLoadingRide ? (
                  <p className="text-xs text-[#929bad]">
                    Loading your next journey...
                  </p>
                ) : upcomingRide ? (
                  <>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                        {upcomingRide.origin.name}
                        <span className="text-[#8b78ff]">→</span>
                        {upcomingRide.destination.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#929bad]">
                        {upcomingRide.availableSeats} seats available
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        ₹{upcomingRide.pricePerSeat}
                        <span className="text-[9px] text-[#929bad]">
                          {' '}
                          / seat
                        </span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">
                      Your next journey starts here
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#929bad]">
                      Find a ride or offer your available seats.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ride Search */}
      <section
        id="ride-search"
        className="scroll-mt-24 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-7"
      >
        <RideSearchForm onSearch={handleSearch} />
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">Quick Actions</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Manage your journeys from one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map(
            ({ label, description, icon: Icon, color, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-[#252e3e] bg-[#111722] p-5 text-left shadow-lg transition hover:border-[#36e0c0]/50"
              >
                <div>
                  <Icon size={20} className={`mb-3 ${color}`} />
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                  <p className="mt-1 text-xs text-gray-400">{description}</p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-[#36e0c0]"
                />
              </button>
            ),
          )}
        </div>
      </section>

      {/* Your Next Trip */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">Your Next Trip</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Your upcoming scheduled journey and ride information.
          </p>
        </div>

        {isLoadingRide ? (
          <LoadingState message="Loading your upcoming ride..." />
        ) : rideError ? (
          <EmptyState
            title="Unable to load your upcoming ride"
            description="Please try again later or visit My Rides to view your journeys."
            icon={<MapPin size={30} />}
            action={
              <button
                type="button"
                onClick={() => navigate('/my-rides')}
                className="rounded-xl bg-[#8b78ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7964f5]"
              >
                View My Rides
              </button>
            }
          />
        ) : upcomingRide ? (
          <div className="space-y-4 rounded-3xl border border-[#252e3e] bg-[#111722] p-6 shadow-2xl">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-[#252e3e] pb-4 sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-3 py-1 text-[11px] font-semibold text-[#36e0c0]">
                {upcomingRide.status.toUpperCase()}
              </span>

              <span className="font-mono text-[11px] text-[#929bad]">
                Ref: #RIDE-{upcomingRide.id.slice(0, 5).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full border-2 border-[#36e0c0] bg-[#080b12]" />
                    <span className="my-1 h-10 w-0.5 bg-[#252e3e]" />
                    <span className="h-3 w-3 rounded-full border-2 border-[#8b78ff] bg-[#080b12]" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {departureDate?.toLocaleDateString()}
                        {' · '}
                        {departureDate?.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-[11px] text-[#929bad]">
                        {upcomingRide.origin.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white">
                        Destination
                      </p>
                      <p className="text-[11px] text-[#929bad]">
                        {upcomingRide.destination.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#252e3e] bg-[#080b12] p-4 sm:flex-row lg:col-span-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b78ff]/15 text-[#8b78ff]">
                    <CarFront size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      Ride Information
                    </p>
                    <p className="text-[10px] text-[#36e0c0]">
                      Scheduled Journey
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#929bad]">
                      {upcomingRide.availableSeats} seats available
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase text-[#929bad]">
                    Price per Seat
                  </p>
                  <p className="text-sm font-bold text-white">
                    ₹{upcomingRide.pricePerSeat}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#36e0c0]">
                <ShieldCheck size={14} />
                Ride status: {upcomingRide.status}
              </span>

              <button
                type="button"
                onClick={() => navigate(`/rides/${upcomingRide.id}`)}
                className="cursor-pointer rounded-xl bg-[#8b78ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7964f5]"
              >
                View Ride Details →
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No upcoming rides found"
            description="You haven't scheduled an upcoming ride yet. Offer a ride to get started."
            icon={<MapPin size={30} />}
          />
        )}
      </section>

      {/* Regular Journeys & Driver Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Regular Journeys */}
        <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <RefreshCw size={14} className="text-[#36e0c0]" />
              Your Regular Journeys
            </h3>

            <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">
                Recurring Journey Management
              </p>
              <CalendarDays size={16} className="text-[#36e0c0]" />
            </div>

            <p className="text-[11px] text-[#929bad]">
              Your regular travel schedules and recurring journeys will appear
              here when the feature becomes available.
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-[#252e3e]/60 pt-2 text-xs">
              <div>
                <span className="text-[10px] text-[#929bad]">
                  REGULAR ROUTES
                </span>
                <p className="font-bold text-white">Coming Soon</p>
              </div>

              <div>
                <span className="text-[10px] text-[#929bad]">SCHEDULES</span>
                <p className="font-bold text-white">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-[#8b78ff] px-4 py-2 text-xs font-semibold text-white opacity-50"
            >
              Manage Recurring Pass
            </button>

            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-[#30394b] bg-[#161b27] px-4 py-2 text-xs font-medium text-[#c7cddd] opacity-50"
            >
              Add New Commute
            </button>
          </div>
        </div>

        {/* Driver Workspace */}
        <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Zap size={14} className="text-[#8b78ff]" />
              Driver Workspace
            </h3>

            <span className="rounded-full bg-[#8b78ff]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#b6a8ff]">
              Host Mode
            </span>
          </div>

          <div className="space-y-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Vehicle Management</p>
              <CarFront size={16} className="text-[#36e0c0]" />
            </div>

            <p className="text-[10px] text-[#929bad]">
              Your registered vehicles and verification details will appear
              here.
            </p>

            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <div>
                <p className="text-[11px] font-bold text-amber-300">
                  BOOKING REQUESTS
                </p>
                <p className="mt-0.5 text-[10px] text-[#929bad]">
                  Passenger requests and their status will appear here.
                </p>
                <p className="text-[9px] text-[#c7cddd]">
                  Booking management is coming soon.
                </p>
              </div>

              <span className="text-[10px] text-amber-300">Coming Soon</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => navigate('/rides/create')}
              className="w-full cursor-pointer rounded-xl border border-[#30394b] bg-[#161b27] py-2.5 text-xs font-medium text-[#c7cddd] transition hover:text-white"
            >
              + Publish a New Highway Ride
            </button>
          </div>
        </div>
      </div>

      {/* AI Mobility Copilot */}
      <section className="space-y-3 rounded-2xl border border-[#8b78ff]/30 bg-gradient-to-r from-[#111722] via-[#161b27] to-[#111722] p-5 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b78ff]/20 text-[#b6a8ff]">
            ✨
          </span>

          <div>
            <h3 className="text-xs font-bold text-white">
              Tripzo AI Mobility Copilot
            </h3>
            <p className="text-[10px] text-[#929bad]">
              Plan your journey using natural language. AI-powered ride
              assistance is coming soon.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="Describe your planned journey..."
            className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] py-3 pl-4 pr-32 text-xs text-white outline-none focus:border-[#8b78ff]"
          />

          <button
            type="button"
            disabled
            className="absolute bottom-1.5 right-1.5 top-1.5 cursor-not-allowed rounded-lg bg-[#8b78ff] px-4 text-xs font-semibold text-white opacity-50"
          >
            Coming Soon
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#929bad]">
          <span>AI JOURNEY ASSISTANCE</span>
          {[
            'Natural Language Search',
            'Journey Recommendations',
            'Coming Soon',
          ].map((label) => (
            <span
              key={label}
              className="rounded bg-[#080b12] px-2 py-0.5 text-white"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Trust & Safety */}
      <div className="grid grid-cols-2 gap-4 border-t border-[#252e3e] pt-4 sm:grid-cols-4">
        {trustBadges.map(({ label, description, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-[#252e3e] bg-[#111722] p-3.5"
          >
            <Icon size={20} className={`shrink-0 ${color}`} />

            <div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[10px] text-[#929bad]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
