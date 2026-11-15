import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  ArrowRight,
  Users,
  IndianRupee,
  Clock,
  MapPin,
  ShieldCheck,
  CarFront,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import LocationPicker from '../components/LocationPicker';
import { searchRides } from '../api/ride.api';

import type {
  Ride,
  RideLocation,
  SearchRidesResult,
} from '../types/ride.types';

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDepartureTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function RideSearchPage() {
  const navigate = useNavigate();
  const searchFormRef = useRef<HTMLDivElement>(null);

  const [origin, setOrigin] = useState<RideLocation | null>(null);
  const [destination, setDestination] = useState<RideLocation | null>(null);

  const [departureDate, setDepartureDate] = useState(getTodayDate());
  const [seats, setSeats] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [results, setResults] = useState<SearchRidesResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const scrollToSearch = () => {
    searchFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!origin || !destination) {
      setError('Please select both pickup and destination locations.');
      return;
    }

    const [originLongitude, originLatitude] = origin.coordinates.coordinates;

    const [destinationLongitude, destinationLatitude] =
      destination.coordinates.coordinates;

    if (
      originLongitude === destinationLongitude &&
      originLatitude === destinationLatitude
    ) {
      setError('Pickup and destination cannot be the same.');
      return;
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('Minimum price cannot exceed maximum price.');
      return;
    }

    try {
      setIsSearching(true);
      setError('');
      setResults(null);

      const response = await searchRides({
        originLongitude,
        originLatitude,
        destinationLongitude,
        destinationLatitude,
        departureDate,
        seats,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: 1,
        limit: 10,
      });

      setResults(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to search rides. Please try again.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 font-sans text-gray-100">
      {/* 1. Hero Banner Section with Greeting & Carpool Image Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#252e3e] bg-[#111722] p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#36e0c0]/30 bg-[#36e0c0]/10 px-3.5 py-1.5 text-xs font-medium text-[#36e0c0]">
              <span className="h-2 w-2 rounded-full bg-[#36e0c0] animate-pulse" />
              NH 66 Express Corridor · Verified Driver &amp; Commuter
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Good morning, Arjun.
              <br />
              <span className="bg-gradient-to-r from-[#8b78ff] via-[#c084fc] to-[#36e0c0] bg-clip-text text-transparent">
                Where are you heading next?
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#929bad] leading-relaxed max-w-xl">
              Find trusted travel companions going your way, or share your empty
              seats to split highway fuel and toll costs across Kerala's coastal
              network.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={scrollToSearch}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8b78ff] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7964f5] shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                <Search size={14} /> Find a Ride
              </button>

              <button
                type="button"
                onClick={() => navigate('/rides/offer')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#30394b] bg-[#161b27] px-4 py-2.5 text-xs font-medium text-[#c7cddd] transition hover:bg-[#202838] hover:text-white cursor-pointer"
              >
                <CarFront size={14} className="text-[#36e0c0]" /> Offer a Ride
                <span className="rounded bg-[#36e0c0]/10 px-1.5 py-0.5 text-[10px] text-[#36e0c0]">
                  ₹350 Est. Split
                </span>
              </button>
            </div>
          </div>

          {/* Right Preview Card matching reference */}
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
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Kasaragod <span className="text-[#8b78ff]">→</span> Kochi
                  </p>
                  <p className="text-[10px] text-[#929bad] mt-0.5">
                    2 seats left · Verified NH 66 Govt ID
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white">
                    ₹350{' '}
                    <span className="text-[9px] text-[#929bad]">/ seat</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form Card inside Banner */}
        <div
          ref={searchFormRef}
          className="mt-8 rounded-2xl border border-[#252e3e] bg-[#080b12] p-5 sm:p-6 shadow-inner scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search size={16} className="text-[#8b78ff]" /> Find your next
              ride
            </h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Locations */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <LocationPicker
                label="ORIGIN"
                placeholder="Kasaragod, Kerala"
                onSelect={setOrigin}
              />

              <LocationPicker
                label="DESTINATION"
                placeholder="Kochi, Kerala"
                onSelect={setDestination}
              />
            </div>

            {/* Date, Seats and Price Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  DATE
                </label>

                <input
                  type="date"
                  value={departureDate}
                  min={getTodayDate()}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  SEATS
                </label>

                <input
                  type="number"
                  min={1}
                  max={8}
                  value={seats}
                  onChange={(event) => setSeats(Number(event.target.value))}
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Min Price (₹)
                </label>

                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="No minimum"
                  className="w-full rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Max Price (₹)
                </label>

                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="No maximum"
                  className="w-full rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#929bad]">
                <MapPin size={14} className="text-[#36e0c0]" />
                <span>Popular corridors:</span>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-6 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-purple-950/30 cursor-pointer"
              >
                <Search size={15} />
                {isSearching ? 'Searching Rides...' : 'Search Rides'}
              </button>
            </div>
          </form>

          {/* Popular Corridors Quick Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#252e3e]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#657086]">
              Popular Corridors:
            </span>
            {[
              'Kasaragod → Kochi ₹350',
              'Kannur → Kozhikode ₹240',
              'Kochi → Trivandrum ₹390',
              'Calicut → Infopark ₹280',
            ].map((chip) => (
              <span
                key={chip}
                onClick={scrollToSearch}
                className="rounded-lg border border-[#252e3e] bg-[#161b27] px-2.5 py-1 text-[11px] text-[#c7cddd] transition hover:border-[#8b78ff]/40 hover:text-white cursor-pointer"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Feature Quick Action Cards (4-column grid with working navigation) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          onClick={scrollToSearch}
          className="rounded-2xl border border-[#252e3e] bg-[#111722] p-4 transition hover:border-[#8b78ff]/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b78ff]/15 text-[#8b78ff]">
              🚗
            </span>
            <ArrowRight
              size={16}
              className="text-[#657086] transition group-hover:translate-x-1 group-hover:text-white"
            />
          </div>
          <h3 className="text-xs font-bold text-white">Find a Ride</h3>
          <p className="mt-1 text-[11px] text-[#929bad] leading-relaxed">
            Search verified journeys &amp; instant seats along NH 66.
          </p>
        </div>

        <div
          onClick={() => navigate('/rides/offer')}
          className="rounded-2xl border border-[#252e3e] bg-[#111722] p-4 transition hover:border-[#36e0c0]/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#36e0c0]/15 text-[#36e0c0]">
              +
            </span>
            <ArrowRight
              size={16}
              className="text-[#657086] transition group-hover:translate-x-1 group-hover:text-white"
            />
          </div>
          <h3 className="text-xs font-bold text-white">Offer a Ride</h3>
          <p className="mt-1 text-[11px] text-[#929bad] leading-relaxed">
            Share empty seats in your registered Hyundai i20.
          </p>
        </div>

        <div
          onClick={() => navigate('/my-rides')}
          className="rounded-2xl border border-[#252e3e] bg-[#111722] p-4 transition hover:border-[#8b78ff]/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              🎫
            </span>
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
              1 UPCOMING
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">My Rides</h3>
          <p className="mt-1 text-[11px] text-[#929bad] leading-relaxed">
            1 upcoming booking confirmed in safety escrow.
          </p>
        </div>

        <div
          onClick={() => navigate('/recurring-rides')}
          className="rounded-2xl border border-[#252e3e] bg-[#111722] p-4 transition hover:border-[#8b78ff]/40 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              ⚡
            </span>
            <span className="rounded-full bg-[#36e0c0]/10 px-2 py-0.5 text-[10px] text-[#36e0c0]">
              MON &amp; THU
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Recurring Rides</h3>
          <p className="mt-1 text-[11px] text-[#929bad] leading-relaxed">
            Active Mon &amp; Thu Kasaragod ↔ Kochi commute schedule.
          </p>
        </div>
      </div>

      {/* 3. "Your Next Trip" Confirmed Ticket Card matching reference */}
      <div className="rounded-3xl border border-[#252e3e] bg-[#111722] p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#252e3e] pb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Your Next Trip</h2>
            <p className="text-[11px] text-[#929bad]">
              Real-time status, verified vehicle credentials, and escrow vault
              verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#36e0c0]/10 border border-[#36e0c0]/25 px-3 py-1 text-[11px] font-semibold text-[#36e0c0]">
              <CheckCircle2 size={13} /> Confirmed in Escrow
            </span>
            <span className="text-[11px] text-[#929bad] font-mono">
              Ref: #TRP-94950
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <span className="h-3 w-3 rounded-full border-2 border-[#36e0c0] bg-[#080b12]" />
                <span className="w-0.5 h-10 bg-[#252e3e] my-1" />
                <span className="h-3 w-3 rounded-full border-2 border-[#8b78ff] bg-[#080b12]" />
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-semibold text-white">
                    08:00 AM · Tomorrow, Oct 4
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    Kasaragod Highway Junction/Under NH Flyover1
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    01:30 PM (Est. 5h 30m)
                  </p>
                  <p className="text-[11px] text-[#929bad]">
                    Kochi Edappally Metro Station- Gate 2 Drop
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-[#252e3e] bg-[#080b12] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Rahul K."
                  className="h-11 w-11 rounded-xl object-cover border border-[#30394b]"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#36e0c0] text-[8px] text-black">
                  ✓
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  Rahul K.{' '}
                  <span className="text-[10px] text-[#36e0c0]">
                    ★ 4.9 (72 trips hosted)
                  </span>
                </p>
                <p className="text-[10px] text-[#929bad] mt-0.5">
                  Silver Hyundai i20 · KL 14 Z 4519
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="rounded bg-[#161b27] px-1.5 py-0.5 text-[9px] text-[#c7cddd]">
                    Front Window Seat
                  </span>
                  <span className="rounded bg-[#161b27] px-1.5 py-0.5 text-[9px] text-[#c7cddd]">
                    AC Cabin
                  </span>
                  <span className="rounded bg-[#161b27] px-1.5 py-0.5 text-[9px] text-[#c7cddd]">
                    Non-Smoking
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase text-[#929bad]">
                Passenger Share
              </p>
              <p className="text-sm font-bold text-white">₹350</p>
              <p className="text-[9px] text-[#36e0c0] mt-0.5">
                Escrowed by Tripzo (VBA—00Corridor)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#252e3e] text-xs">
          <span className="text-[#36e0c0] flex items-center gap-1.5">
            <ShieldCheck size={14} /> Safety Boarding PIN:{' '}
            <strong className="font-mono bg-[#36e0c0]/10 px-2 py-0.5 rounded text-white">
              6892
            </strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/my-rides')}
              className="rounded-xl bg-[#8b78ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7964f5] cursor-pointer"
            >
              Trip Details
            </button>
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="rounded-xl border border-[#30394b] bg-[#161b27] px-4 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white cursor-pointer"
            >
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {results && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#252e3e] pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Available Rides
              </h2>

              <p className="mt-0.5 text-[11px] text-[#929bad]">
                {results.total} verified journey
                {results.total !== 1 ? 's' : ''} found matching your criteria
              </p>
            </div>
          </div>

          {results.rides.length === 0 ? (
            <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-10 text-center shadow-xl">
              <Search size={28} className="mx-auto text-[#657086]" />

              <h3 className="mt-3 text-xs font-semibold text-white">
                No rides found for this date
              </h3>

              <p className="mt-1 text-[11px] text-[#929bad] max-w-sm mx-auto">
                Try changing your travel date or loosening price filters to view
                alternate corridor departures.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {results.rides.map((ride: Ride) => (
                <article
                  key={ride.id}
                  className="rounded-2xl border border-[#252e3e] bg-[#111722] p-4 sm:p-5 transition hover:border-[#8b78ff]/50 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#36e0c0]/10 border border-[#36e0c0]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
                      {ride.availableSeats} seats available
                    </span>

                    <span className="flex items-center gap-0.5 text-xs font-bold text-white">
                      <IndianRupee size={13} />
                      {ride.pricePerSeat}
                      <span className="text-[10px] font-normal text-[#929bad]">
                        / seat
                      </span>
                    </span>
                  </div>

                  <div className="my-4 flex items-center gap-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">
                        {ride.origin.name}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#929bad]">
                        {ride.origin.address}
                      </p>
                    </div>

                    <ArrowRight size={16} className="shrink-0 text-[#8b78ff]" />

                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-xs font-semibold text-white">
                        {ride.destination.name}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#929bad]">
                        {ride.destination.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252e3e] pt-3 text-[11px] text-[#929bad]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#8b78ff]" />
                        {formatDepartureTime(ride.departureTime)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-[#8b78ff]" />
                        {ride.availableSeats} seats left
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Booking flow for ride ${ride.id}`)}
                      className="rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90 shadow-md cursor-pointer"
                    >
                      Book Seat
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. AI Mobility Copilot Prompt Bar */}
      <div className="rounded-2xl border border-[#8b78ff]/30 bg-gradient-to-r from-[#111722] via-[#161b27] to-[#111722] p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b78ff]/20 text-[#b6a8ff]">
            ✨
          </span>
          <div>
            <h3 className="text-xs font-bold text-white">
              Tripzo AI Mobility Copilot
            </h3>
            <p className="text-[10px] text-[#929bad]">
              Planning a highway journey? Describe your plan in plain English or
              Malayalam.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="I need to travel from Kasaragod to Kochi Monday morning. One quiet seat with luggage."
            className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] py-3 pl-4 pr-32 text-xs text-white outline-none focus:border-[#8b78ff]"
          />
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-[#8b78ff] px-4 text-xs font-semibold text-white transition hover:bg-[#7964f5] cursor-pointer"
          >
            Find Matching Rides
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#929bad]">
          <span>INTERPRETED INTENT:</span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            📍 Kasaragod
          </span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            → Kochi
          </span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            📅 Mon, 4:00 AM
          </span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            👤 1 Seat
          </span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            🤫 Quiet Cabin
          </span>
          <span className="rounded bg-[#080b12] px-2 py-0.5 text-white">
            🧳 Boot Space Included
          </span>
        </div>
      </div>
    </div>
  );
}
