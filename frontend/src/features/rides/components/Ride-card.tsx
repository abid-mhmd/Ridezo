import {
  MapPin,
  Cigarette,
  PawPrint,
  Armchair,
  Wind,
  Star,
  BadgeCheck,
  ArrowRight,
  CarFront,
  Users,
  Bookmark,
  CalendarDays,
  Clock,
} from 'lucide-react';

import type { Ride } from '../types/ride.types';

interface RideCardProps {
  ride: Ride;
  onViewDetails: (rideId: string) => void;
  onSave?: (rideId: string) => void;
  isSaved?: boolean;
}

export default function RideCard({
  ride,
  onViewDetails,
  onSave,
  isSaved = false,
}: RideCardProps) {
  const departureDate = new Date(ride.departureTime);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatPreference = (value: string) =>
    value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const preferences = [
    { label: ride.preferences?.climateControl, icon: Wind },
    { label: ride.preferences?.smoking, icon: Cigarette },
    { label: ride.preferences?.pets, icon: PawPrint },
    { label: ride.preferences?.seatingComfort, icon: Armchair },
  ].filter((item) => item.label);

  const driverName = ride.driver
    ? `${ride.driver.firstName} ${ride.driver.lastName}`
    : 'Driver information unavailable';

  const isVerified =
    ride.driver?.identityVerificationStatus?.toLowerCase() === 'verified';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] p-3 font-sans text-gray-100 shadow-xl transition duration-200 hover:border-[#8b78ff]/50 sm:p-3.5">
      {/* Header: Driver and Vehicle in Two Columns */}
      <div className="grid grid-cols-2 divide-x divide-[#252e3e]">
        {/* Driver Information */}
        <div className="min-w-0 pr-2.5">
          <div className="flex items-center gap-2">
            {ride.driver?.profilePhoto ? (
              <img
                src={ride.driver.profilePhoto}
                alt={driverName}
                className="h-10 w-10 shrink-0 rounded-xl border border-[#30394b] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#252e3e] text-sm font-semibold text-white">
                {ride.driver?.firstName?.charAt(0) ?? 'D'}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="truncate text-xs font-bold text-white">
                {driverName}
              </h3>

              {isVerified && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-semibold text-[#36e0c0]">
                  <BadgeCheck size={10} />
                  Verified Driver
                </span>
              )}
            </div>
          </div>

          {ride.driver && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-[#929bad]">
              <span className="flex items-center gap-1 font-medium text-amber-300">
                <Star size={10} className="fill-amber-300" />
                {ride.driver.rating.toFixed(1)}
              </span>

              <span>· {ride.driver.reviewCount} reviews</span>
              <span>· {ride.driver.completedRideCount} trips</span>
            </div>
          )}

          {ride.driver?.languages?.length ? (
            <p className="mt-1 truncate text-[9px] text-[#929bad]">
              Languages: {ride.driver.languages.join(', ')}
            </p>
          ) : null}
        </div>

        {/* Vehicle Information */}
        <div className="min-w-0 pl-2.5">
          <div className="flex items-center gap-2">
            {ride.vehicle?.vehiclePhoto ? (
              <img
                src={ride.vehicle.vehiclePhoto}
                alt={`${ride.vehicle.brand} ${ride.vehicle.model}`}
                className="h-10 w-14 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-[#202938]">
                <CarFront size={20} className="text-[#8b78ff]" />
              </div>
            )}

            <div className="min-w-0">
              {ride.vehicle ? (
                <>
                  <p className="truncate text-xs font-semibold text-white">
                    {ride.vehicle.brand} {ride.vehicle.model}
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#929bad]">
                    {ride.vehicle.year} · {ride.vehicle.color}
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-[#929bad]">
                  Vehicle unavailable
                </p>
              )}
            </div>
          </div>

          {ride.vehicle && (
            <span className="mt-1.5 inline-block rounded-md border border-[#36e0c0]/20 bg-[#36e0c0]/10 px-1.5 py-0.5 text-[9px] text-[#36e0c0]">
              {formatPreference(ride.vehicle.verificationStatus)}
            </span>
          )}
        </div>
      </div>

      {/* Price and Bookmark */}
      <div className="mt-2 flex items-center justify-between border-t border-[#252e3e] pt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-[#929bad]">
          <CalendarDays size={11} className="text-[#8b78ff]" />
          {formatDate(departureDate)}
          <span className="text-gray-600">·</span>
          <Clock size={11} className="text-[#8b78ff]" />
          {formatTime(departureDate)}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-base font-bold leading-none text-white">
              ₹{ride.pricePerSeat}
            </p>
            <p className="mt-0.5 text-[9px] text-[#929bad]/70">per seat</p>
          </div>

          <span className="rounded-full border border-[#36e0c0]/20 bg-[#36e0c0]/10 px-2 py-1 text-[9px] font-semibold text-[#36e0c0]">
            {ride.availableSeats} left
          </span>

          <button
            type="button"
            onClick={() => onSave?.(ride.id)}
            aria-label={isSaved ? 'Remove saved ride' : 'Save ride'}
            aria-pressed={isSaved}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition ${
              isSaved
                ? 'border-[#b5a8ff]/40 bg-[#8b78ff]/20 text-[#c4b5fd]'
                : 'border-[#252e3e] bg-[#080b12] text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Journey Route */}
      <div className="mt-2 rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
        {/* Origin and Destination */}
        <div className="flex items-center justify-between gap-2">
          {/* Origin */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#36e0c0]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#36e0c0]" />
              Pickup
            </div>

            <p className="mt-0.5 truncate pl-2.5 text-xs font-semibold text-white">
              {ride.origin.name}
            </p>

            <p className="truncate pl-2.5 text-[9px] text-[#929bad]/70">
              {ride.origin.address}
            </p>
          </div>

          {/* Route Connector */}
          <div className="flex shrink-0 items-center px-1">
            <span className="h-px w-3 bg-[#8b78ff]/50" />
            <ArrowRight size={14} className="text-[#8b78ff]" />
            <span className="h-px w-3 bg-[#8b78ff]/50" />
          </div>

          {/* Destination */}
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#8b78ff]">
              Destination
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b78ff]" />
            </div>

            <p className="mt-0.5 truncate pr-2.5 text-xs font-semibold text-white">
              {ride.destination.name}
            </p>

            <p className="truncate pr-2.5 text-[9px] text-[#929bad]/70">
              {ride.destination.address}
            </p>
          </div>
        </div>

        {/* Intermediate Stops */}
        {ride.stops?.length > 0 && (
          <div className="mt-2 flex items-start gap-2 border-t border-[#252e3e] pt-1.5">
            <MapPin size={11} className="mt-0.5 shrink-0 text-[#36e0c0]" />

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#929bad]">
                Intermediate stops ({ride.stops.length})
              </p>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] text-[#c7cddd]">
                {ride.stops.map((stop, index) => (
                  <span
                    key={stop.placeId || index}
                    className="inline-flex items-center gap-1"
                  >
                    <span>{stop.name}</span>

                    {index < ride.stops.length - 1 && (
                      <span className="text-[#8b78ff]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seats and Preferences */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#252e3e] bg-[#080b12] px-2 py-1 text-[9px] text-gray-300">
          <Users size={10} className="text-[#36e0c0]" />
          {ride.availableSeats}/{ride.totalSeats} seats
        </span>

        {preferences.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-lg border border-[#252e3e] bg-[#080b12] px-2 py-1 text-[9px] text-[#929bad]"
          >
            <Icon size={10} className="text-[#36e0c0]" />
            {formatPreference(label!)}
          </span>
        ))}
      </div>

      {/* Pickup Instructions */}
      {ride.pickupInstructions && (
        <div className="mt-1.5 rounded-lg border border-[#252e3e] bg-[#151d29] px-2.5 py-1.5 text-[9px] text-gray-300">
          <span className="font-semibold text-gray-200">
            Pickup instructions:
          </span>{' '}
          {ride.pickupInstructions}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#252e3e] pt-2">
        <span className="font-mono text-[9px] text-[#929bad]/60">
          ID: {ride.id.slice(-6)}
        </span>

        <button
          type="button"
          onClick={() => onViewDetails(ride.id)}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-md shadow-purple-950/30 transition hover:opacity-90"
        >
          View Ride Details
          <ArrowRight size={12} />
        </button>
      </div>
    </article>
  );
}
