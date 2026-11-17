import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import type { Ride } from '../types/ride.types';

interface RideCardProps {
  ride: Ride;
  onViewDetails: (rideId: string) => void;
}

export default function RideCard({ ride, onViewDetails }: RideCardProps) {
  const departureDate = new Date(ride.departureTime);

  return (
    <article className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 transition hover:border-[#36e0c0]/40">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        {/* Journey information */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-1 shrink-0 text-[#36e0c0]" />

            <div>
              <h3 className="font-semibold text-white">{ride.origin.name}</h3>

              <p className="mt-1 text-sm text-gray-400">
                To {ride.destination.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <CalendarDays size={15} />
              {departureDate.toLocaleDateString()}
            </span>

            <span className="flex items-center gap-2">
              <Clock size={15} />
              {departureDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            <span className="flex items-center gap-2">
              <Users size={15} />
              {ride.availableSeats} seats available
            </span>
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between gap-4 border-t border-[#252e3e] pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div>
            <p className="text-xl font-bold text-[#36e0c0]">
              ₹{ride.pricePerSeat}
            </p>

            <p className="text-xs text-gray-400">per seat</p>
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(ride.id)}
            className="rounded-lg bg-[#36e0c0] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#25c9aa]"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
