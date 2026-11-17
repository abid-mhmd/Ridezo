import { useState } from 'react';
import { SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface RideFiltersProps {
  initialMinPrice?: number;
  initialMaxPrice?: number;
  onApply: (filters: { minPrice?: number; maxPrice?: number }) => void;
}

export default function RideFilters({
  initialMinPrice,
  initialMaxPrice,
  onApply,
}: RideFiltersProps) {
  const [minPrice] = useState(initialMinPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(
    initialMaxPrice?.toString() ?? '400',
  );
  const [selectedSeatTab, setSelectedSeatTab] = useState<'1' | '2' | '3'>('1');
  const [error, setError] = useState('');

  const handlePriceChange = (val: string) => {
    setMaxPrice(val);
    const max = val === '' ? undefined : Number(val);
    onApply({
      minPrice: minPrice === '' ? undefined : Number(minPrice),
      maxPrice: max,
    });
  };

  const handleClear = () => {
    setMaxPrice('600');
    setError('');
    onApply({});
  };

  return (
    <aside className="w-full rounded-2xl border border-[#252e3e] bg-[#111722] p-5 font-sans text-gray-100 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#8b78ff]" /> Filter
          rides
        </h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] text-[#36e0c0] hover:underline cursor-pointer"
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
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-[#080b12] accent-[#8b78ff]"
              />
              Morning (06:00 - 12:00)
            </span>
            <span className="text-[10px] text-[#657086]">[5]</span>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-[#080b12] accent-[#8b78ff]"
              />
              Afternoon (12:00 - 18:00)
            </span>
            <span className="text-[10px] text-[#657086]">[4]</span>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-[#080b12] accent-[#8b78ff]"
              />
              Evening (18:00 - 24:00)
            </span>
            <span className="text-[10px] text-[#657086]">[3]</span>
          </label>
        </div>
      </div>

      {/* 2. Max Price / Seat */}
      <div className="space-y-2.5 pt-2 border-t border-[#252e3e]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
            MAX PRICE / SEAT
          </span>
          <span className="font-mono font-bold text-[#36e0c0]">
            ₹{maxPrice || '400'}
          </span>
        </div>

        <input
          type="range"
          min="150"
          max="600"
          step="25"
          value={maxPrice}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-full accent-[#8b78ff]"
        />

        <div className="flex justify-between text-[10px] text-[#657086]">
          <span>₹150</span>
          <span>₹600</span>
        </div>
      </div>
      {/* 3. Seats Needed */}
      <div className="space-y-2 pt-2 border-t border-[#252e3e]">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          SEATS NEEDED
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {(['1', '2', '3'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSeatTab(s)}
              className={`rounded-lg border py-1 text-center text-[11px] font-medium transition cursor-pointer ${
                selectedSeatTab === s
                  ? 'border-[#8b78ff] bg-[#8b78ff]/20 text-white shadow-sm'
                  : 'border-[#252e3e] bg-[#080b12] text-[#929bad] hover:text-white'
              }`}
            >
              {s === '3' ? '3+ Seats' : `${s} Seat`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Trust & Driver Tier */}
      <div className="space-y-2.5 pt-2 border-t border-[#252e3e]">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          TRUST &amp; DRIVER TIER
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Verified ID &amp; Gov ID 🛡️
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Woman Driver Only ♀
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Top Rated (4.8+ ★) ⭐
          </label>
        </div>
      </div>

      {/* 5. Vehicle & Comfort */}
      <div className="space-y-2.5 pt-2 border-t border-[#252e3e]">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          VEHICLE &amp; COMFORT
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            AC Cabin ❄
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Clean EV Only ⚡
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Max 2 in Backseat 💺
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Luggage Space (Boot) 🧳
          </label>
        </div>
      </div>

      {/* 6. Driver Language */}
      <div className="space-y-2.5 pt-2 border-t border-[#252e3e]">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
          DRIVER LANGUAGE
        </h4>
        <div className="space-y-2 text-xs text-[#c7cddd]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Malayalam (फ्लूएंट)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            English
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-[#080b12] accent-[#8b78ff]"
            />
            Hindi
          </label>
        </div>
      </div>

      {/* Tripzo Secure Escrow Badge Box */}
      <div className="rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 p-3 space-y-1">
        <p className="text-[11px] font-bold text-[#36e0c0] flex items-center gap-1.5">
          <ShieldCheck size={14} /> Tripzo Secure Escrow
        </p>
        <p className="text-[10px] text-[#c7cddd] leading-relaxed">
          Driver is only paid after you arrive safely at your drop-off station
          and authenticate completion.
        </p>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </aside>
  );
}
