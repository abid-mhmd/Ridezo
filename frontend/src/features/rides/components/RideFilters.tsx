import { SlidersHorizontal, ShieldCheck } from 'lucide-react';

export type DepartureWindow = 'morning' | 'afternoon' | 'evening';

export interface RideFilterState {
  departureWindows: DepartureWindow[];
  maxPrice?: number;
  seats: number;
  verifiedDriverOnly: boolean;
  topRatedOnly: boolean;
  acCabinOnly: boolean;
  maxTwoBackseatOnly: boolean;
  languages: string[];
}

interface RideFiltersProps {
  filters: RideFilterState;
  onChange: (next: RideFilterState) => void;
  onClear: () => void;
}

const WINDOWS: { value: DepartureWindow; label: string }[] = [
  { value: 'morning', label: 'Morning (Before 12:00)' },
  { value: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
  { value: 'evening', label: 'Evening (18:00 - 24:00)' },
];

const LANGUAGES = ['Malayalam', 'English', 'Hindi'];

export default function RideFilters({
  filters,
  onChange,
  onClear,
}: RideFiltersProps) {
  const toggleWindow = (win: DepartureWindow) => {
    const exists = filters.departureWindows.includes(win);
    const next = exists
      ? filters.departureWindows.filter((w) => w !== win)
      : [...filters.departureWindows, win];
    onChange({ ...filters, departureWindows: next });
  };

  const toggleLanguage = (lang: string) => {
    const exists = filters.languages.includes(lang);
    const next = exists
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    onChange({ ...filters, languages: next });
  };

  return (
    <aside className="w-full space-y-5 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 font-sans text-gray-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
          <SlidersHorizontal size={14} className="text-[#8b78ff]" /> Filter
          rides
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-[11px] text-[#36e0c0] hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* 1. Departure Window */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          DEPARTURE WINDOW
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          {WINDOWS.map((win) => (
            <label
              key={win.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={filters.departureWindows.includes(win.value)}
                onChange={() => toggleWindow(win.value)}
                className="rounded bg-[#080b12] accent-[#8b78ff]"
              />
              <span>{win.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Max Price / Seat */}
      <div className="space-y-2.5 border-t border-[#252e3e] pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
            MAX PRICE / SEAT
          </span>
          <span className="font-mono font-bold text-[#36e0c0]">
            {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
          </span>
        </div>

        <input
          type="range"
          min="100"
          max="2000"
          step="50"
          value={filters.maxPrice ?? 2000}
          onChange={(e) => {
            const val = Number(e.target.value);
            onChange({
              ...filters,
              maxPrice: val >= 2000 ? undefined : val,
            });
          }}
          className="w-full accent-[#8b78ff]"
        />

        <div className="flex justify-between text-[10px] text-[#657086]">
          <span>₹100</span>
          <span>₹2000+</span>
        </div>
      </div>

      {/* 3. Seats Needed */}
      <div className="space-y-2 border-t border-[#252e3e] pt-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          SEATS NEEDED
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((seatCount) => (
            <button
              key={seatCount}
              type="button"
              onClick={() => onChange({ ...filters, seats: seatCount })}
              className={`cursor-pointer rounded-lg border py-1.5 text-center text-[11px] font-medium transition ${
                filters.seats === seatCount
                  ? 'border-[#8b78ff] bg-[#8b78ff]/20 text-white shadow-sm'
                  : 'border-[#252e3e] bg-[#080b12] text-[#929bad] hover:text-white'
              }`}
            >
              {seatCount === 3 ? '3+ Seats' : `${seatCount}+ Seat`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Trust & Driver Tier */}
      <div className="space-y-2.5 border-t border-[#252e3e] pt-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          TRUST &amp; DRIVER TIER
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.verifiedDriverOnly}
              onChange={(e) =>
                onChange({ ...filters, verifiedDriverOnly: e.target.checked })
              }
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Verified ID &amp; Gov ID
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.topRatedOnly}
              onChange={(e) =>
                onChange({ ...filters, topRatedOnly: e.target.checked })
              }
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Top Rated (4.8+ ★)
          </label>
        </div>
      </div>

      {/* 5. Vehicle & Comfort */}
      <div className="space-y-2.5 border-t border-[#252e3e] pt-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          VEHICLE &amp; COMFORT
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.acCabinOnly}
              onChange={(e) =>
                onChange({ ...filters, acCabinOnly: e.target.checked })
              }
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            AC Cabin
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.maxTwoBackseatOnly}
              onChange={(e) =>
                onChange({ ...filters, maxTwoBackseatOnly: e.target.checked })
              }
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Max 2 in Backseat
          </label>
        </div>
      </div>

      {/* 6. Driver Language */}
      <div className="space-y-2.5 border-t border-[#252e3e] pt-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          DRIVER LANGUAGE
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          {LANGUAGES.map((lang) => (
            <label
              key={lang}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={filters.languages.includes(lang)}
                onChange={() => toggleLanguage(lang)}
                className="rounded bg-[#080b12] accent-[#8b78ff]"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ridezo Secure Escrow Badge Box */}
      <div className="space-y-1 rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#36e0c0]">
          <ShieldCheck size={14} /> Ridezo Secure Escrow
        </p>
        <p className="text-[10px] leading-relaxed text-[#c7cddd]">
          Driver is only paid after you arrive safely at your drop-off station
          and authenticate completion.
        </p>
      </div>
    </aside>
  );
}
