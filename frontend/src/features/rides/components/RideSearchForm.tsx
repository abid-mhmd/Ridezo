import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';

import LocationPicker from './LocationPicker';
import type { RideLocation } from '../types/ride.types';

export interface RideSearchFormValues {
  origin: RideLocation;
  destination: RideLocation;
  departureDate: string;
  seats: number;
}

interface RideSearchFormProps {
  initialValues?: Partial<RideSearchFormValues>;
  onSearch: (values: RideSearchFormValues) => void;
  isSearching?: boolean;
}

const POPULAR_CORRIDORS = [
  'Kasaragod → Kochi ₹350',
  'Kannur → Kozhikode ₹240',
  'Kochi → Trivandrum ₹390',
  'Calicut → Infopark ₹280',
] as const;

function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function RideSearchForm({
  initialValues,
  onSearch,
  isSearching = false,
}: RideSearchFormProps) {
  const [origin, setOrigin] = useState<RideLocation | null>(
    initialValues?.origin ?? null,
  );
  const [destination, setDestination] = useState<RideLocation | null>(
    initialValues?.destination ?? null,
  );
  const [departureDate, setDepartureDate] = useState(
    initialValues?.departureDate ?? getTodayDate(),
  );
  const [seats, setSeats] = useState(initialValues?.seats ?? 1);
  const [error, setError] = useState('');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setError('');
  };

  const handleCorridorClick = (corridor: string) => {
    const routePart = corridor.split('₹')[0].trim();
    const [rawOrigin, rawDestination] = routePart
      .split('→')
      .map((part) => part.trim());

    if (!rawOrigin || !rawDestination) return;

    setError('');
    if (!departureDate || departureDate < getTodayDate()) {
      setDepartureDate(getTodayDate());
    }
    setError(
      `Select "${rawOrigin}" in Origin and "${rawDestination}" in Destination from the location suggestions to search this corridor.`,
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!origin || !destination) {
      setError('Please select both pickup and destination locations.');
      return;
    }

    const [originLng, originLat] = origin.coordinates.coordinates;
    const [destinationLng, destinationLat] =
      destination.coordinates.coordinates;

    if (originLng === destinationLng && originLat === destinationLat) {
      setError('Pickup and destination cannot be the same.');
      return;
    }

    if (!departureDate || departureDate < getTodayDate()) {
      setError('Please select a valid travel date.');
      return;
    }

    if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
      setError('Please select a valid seat count.');
      return;
    }

    setError('');
    onSearch({ origin, destination, departureDate, seats });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {/* Top Header inside search bar card */}
      <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
        <div className="flex items-center gap-2 text-white">
          <Search size={16} className="text-[#8b78ff]" />
          <h3 className="text-sm font-bold tracking-tight">
            Find your next ride
          </h3>
        </div>
      </div>

      {/* Inputs Row with Swap Button */}
      <div className="relative grid grid-cols-1 items-center gap-3 md:grid-cols-4">
        <div className="md:col-span-1">
          <LocationPicker
            label="ORIGIN"
            placeholder="Kasaragod, Kerala"
            value={origin}
            onSelect={(loc) => {
              setOrigin(loc);
              setError('');
            }}
          />
        </div>

        {/* Swap Button */}
        <div className="z-10 flex justify-center md:absolute md:left-1/2 md:top-7 md:-translate-x-1/2">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#252e3e] bg-[#080b12] text-[#929bad] shadow-md transition hover:border-[#8b78ff] hover:text-white"
          >
            <ArrowLeftRight size={14} />
          </button>
        </div>

        <div className="md:col-span-1">
          <LocationPicker
            label="DESTINATION"
            placeholder="Kochi, Kerala"
            value={destination}
            onSelect={(loc) => {
              setDestination(loc);
              setError('');
            }}
          />
        </div>

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
            className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white/70 outline-none transition focus:border-[#8b78ff] focus:text-white"
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
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
              className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white/70 outline-none transition focus:border-[#8b78ff] focus:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-[38px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={14} />
            {isSearching ? 'Searching...' : 'Search Rides'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* Popular Corridors Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#252e3e] pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#657086]">
          POPULAR CORRIDORS:
        </span>
        {POPULAR_CORRIDORS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleCorridorClick(chip)}
            className="cursor-pointer rounded-lg border border-[#252e3e] bg-[#161b27] px-2.5 py-1 text-[11px] text-[#c7cddd] transition hover:border-[#8b78ff]/40 hover:text-white"
          >
            {chip}
          </button>
        ))}
      </div>
    </form>
  );
}
