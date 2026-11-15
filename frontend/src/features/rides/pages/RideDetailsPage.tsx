import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  CarFront,
  Cigarette,
  PawPrint,
  Snowflake,
  Armchair,
  LoaderCircle,
} from 'lucide-react';

import { getRideDetails } from '../api/ride.api';
import type { Ride } from '../types/ride.types';

function formatDepartureTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

function formatPreference(value?: string): string {
  if (!value) return 'Not specified';

  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function RideDetailsPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchRideDetails() {
      if (!rideId) {
        setError('Invalid ride ID.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await getRideDetails(rideId);

        if (isMounted) {
          setRide(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load ride details.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchRideDetails();

    return () => {
      isMounted = false;
    };
  }, [rideId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#929bad]">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        Loading ride details...
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h2 className="text-lg font-semibold text-white">
          Unable to load ride
        </h2>

        <p className="mt-2 text-sm text-red-400">
          {error || 'Ride not found.'}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 rounded-xl bg-[#8b78ff] px-5 py-2.5 text-sm text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const routePoints = [ride.origin, ...ride.stops, ride.destination];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 text-gray-100">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-[#929bad] transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Route overview */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[#36e0c0]/10 px-3 py-1 text-xs font-medium text-[#36e0c0]">
            {ride.status.toUpperCase()}
          </span>

          <span className="text-xs text-[#929bad]">Ride ID: {ride.id}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-xs text-[#929bad]">FROM</p>
            <h1 className="mt-1 text-xl font-bold text-white">
              {ride.origin.name}
            </h1>
            <p className="mt-1 text-xs text-[#929bad]">{ride.origin.address}</p>
          </div>

          <ArrowRight size={24} className="hidden text-[#8b78ff] sm:block" />

          <div className="sm:text-right">
            <p className="text-xs text-[#929bad]">TO</p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {ride.destination.name}
            </h2>
            <p className="mt-1 text-xs text-[#929bad]">
              {ride.destination.address}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#252e3e] pt-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="text-[#8b78ff]" size={19} />
            <div>
              <p className="text-xs text-[#929bad]">Departure</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatDepartureTime(ride.departureTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="text-[#8b78ff]" size={19} />
            <div>
              <p className="text-xs text-[#929bad]">Available Seats</p>
              <p className="mt-1 text-sm font-medium text-white">
                {ride.availableSeats} / {ride.totalSeats}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IndianRupee className="text-[#36e0c0]" size={19} />
            <div>
              <p className="text-xs text-[#929bad]">Price Per Seat</p>
              <p className="mt-1 text-sm font-bold text-white">
                ₹{ride.pricePerSeat}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Route and stops */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
        <h2 className="text-base font-bold text-white">Route & Stops</h2>

        <p className="mt-1 text-xs text-[#929bad]">
          Your journey's pickup and destination points.
        </p>

        <div className="mt-6 space-y-0">
          {routePoints.map((point, index) => {
            const isFirst = index === 0;
            const isLast = index === routePoints.length - 1;

            return (
              <div key={`${point.placeId}-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      isFirst
                        ? 'bg-[#36e0c0]'
                        : isLast
                          ? 'bg-[#8b78ff]'
                          : 'bg-[#929bad]'
                    }`}
                  />

                  {!isLast && (
                    <span className="my-1 min-h-12 w-0.5 flex-1 bg-[#30394b]" />
                  )}
                </div>

                <div className="pb-6">
                  <p className="text-sm font-semibold text-white">
                    {point.name}
                  </p>

                  <p className="mt-1 text-xs text-[#929bad]">{point.address}</p>

                  <span className="mt-2 inline-block text-[10px] font-medium text-[#36e0c0]">
                    {isFirst
                      ? 'Starting Point'
                      : isLast
                        ? 'Destination'
                        : 'Intermediate Stop'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ride preferences */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
        <h2 className="text-base font-bold text-white">Ride Preferences</h2>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              label: 'Smoking',
              value: ride.preferences.smoking,
              icon: Cigarette,
            },
            {
              label: 'Pets',
              value: ride.preferences.pets,
              icon: PawPrint,
            },
            {
              label: 'Seating Comfort',
              value: ride.preferences.seatingComfort,
              icon: Armchair,
            },
            {
              label: 'Climate Control',
              value: ride.preferences.climateControl,
              icon: Snowflake,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-4"
              >
                <Icon size={18} className="text-[#8b78ff]" />

                <div>
                  <p className="text-xs text-[#929bad]">{item.label}</p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {formatPreference(item.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pickup instructions */}
      {ride.pickupInstructions && (
        <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#36e0c0]" />

            <h2 className="text-base font-bold text-white">
              Pickup Instructions
            </h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#929bad]">
            {ride.pickupInstructions}
          </p>
        </section>
      )}

      {/* Vehicle reference */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <CarFront size={20} className="text-[#8b78ff]" />

          <div>
            <h2 className="text-base font-bold text-white">
              Vehicle Reference
            </h2>

            <p className="mt-1 text-xs text-[#929bad]">
              Vehicle ID: {ride.vehicleId}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
