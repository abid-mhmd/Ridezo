import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CarFront,
  LoaderCircle,
  BadgeCheck,
  Star,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Bookmark,
  MessageSquare,
  Phone,
} from 'lucide-react';

import { getRideDetails } from '../api/ride.api';
import { createBooking } from '../../bookings/api/booking.api';

import type { Ride } from '../types/ride.types';

function formatDepartureTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
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
  const [seatsToReserve, setSeatsToReserve] = useState(1);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  async function handleBooking() {
    if (!rideId || !ride || isBooking) return;

    try {
      setIsBooking(true);
      setBookingError('');

      const booking = await createBooking({
        rideId,
        seatsRequested: seatsToReserve,
      });

      navigate('/booking-success', {
        state: { booking },
      });
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : 'Unable to submit booking request.',
      );
    } finally {
      setIsBooking(false);
    }
  }

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
          setSeatsToReserve(1);
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
      <div className="flex min-h-[60vh] items-center justify-center font-sans text-xs text-[#929bad]">
        <LoaderCircle className="mr-2 animate-spin text-[#8b78ff]" size={16} />
        Loading ride details &amp; escrow data...
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center font-sans">
        <h2 className="text-sm font-semibold text-white">
          Unable to load ride
        </h2>

        <p className="mt-1 text-xs text-red-400">
          {error || 'Ride not found.'}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const driver = ride.driver;
  const vehicle = ride.vehicle;

  const driverName = driver
    ? `${driver.firstName} ${driver.lastName}`.trim()
    : 'Anand K.';

  const driverRating = driver?.rating ?? 4.9;
  const driverReviewCount = driver?.reviewCount ?? 72;
  const completedTrips = driver?.completedRideCount ?? 120;

  const isDriverVerified =
    driver?.identityVerificationStatus?.toLowerCase() === 'verified';

  const isVehicleVerified =
    vehicle?.verificationStatus?.toLowerCase() === 'verified';

  const routePoints = [
    { ...ride.origin, type: 'origin' },
    ...ride.stops.map((stop) => ({ ...stop, type: 'stop' })),
    { ...ride.destination, type: 'destination' },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-16 font-sans text-gray-100">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Search Results
        </button>

        <span className="font-mono text-[11px] text-[#929bad]">
          Ride ID: {ride.id}
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-5 lg:col-span-8">
          {/* Route Overview Banner */}
          <section className="relative space-y-4 overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-3 py-0.5 text-[11px] font-semibold text-[#36e0c0]">
                <CheckCircle2 size={12} />
                {ride.status.toUpperCase()} DEPARTURE · Guaranteed Shared Ride
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Save ride"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[#252e3e] bg-[#080b12] text-[#929bad] transition hover:text-white"
                >
                  <Bookmark size={13} />
                </button>

                <button
                  type="button"
                  aria-label="Share ride"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[#252e3e] bg-[#080b12] text-[#929bad] transition hover:text-white"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>

            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-white sm:text-2xl">
                {ride.origin.name.split(',')[0]}
                <span className="text-[#8b78ff]">→</span>
                {ride.destination.name.split(',')[0]}
              </h1>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#929bad]">
                <Clock size={12} />
                {formatDepartureTime(ride.departureTime)}
              </p>
            </div>

            {/* Ride Metrics */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-[#252e3e] pt-3 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Departure</p>
                <p className="mt-0.5 font-bold text-white">
                  {formatTime(ride.departureTime)}
                </p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Duration</p>
                <p className="mt-0.5 font-bold text-white">4h 45m</p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Arrival</p>
                <p className="mt-0.5 font-bold text-white">12:15 PM</p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">
                  Availability
                </p>
                <p className="mt-0.5 font-bold text-[#36e0c0]">
                  {ride.availableSeats} left
                </p>
              </div>
            </div>
          </section>

          {/* Highway Route & Stopovers */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Highway Route &amp; Stopovers
                </h2>
                <p className="text-[10px] text-[#929bad]">
                  Precise milestone schedule along National Highway 66.
                </p>
              </div>

              <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#36e0c0]">
                365 km total
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {routePoints.map((point, index) => {
                const isOrigin = point.type === 'origin';
                const isDestination = point.type === 'destination';

                return (
                  <div
                    key={point.placeId || index}
                    className="flex items-start gap-3"
                  >
                    <div className="flex flex-col items-center pt-1">
                      <span
                        className={`h-3 w-3 rounded-full border-2 ${
                          isOrigin ? 'border-[#36e0c0]' : 'border-[#8b78ff]'
                        } bg-[#080b12]`}
                      />

                      {index < routePoints.length - 1 && (
                        <span className="my-0.5 h-10 w-0.5 bg-[#30394b]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-white">
                          {isOrigin
                            ? 'Pickup Point'
                            : isDestination
                              ? 'Final Drop-off'
                              : `Stop ${index}`}
                        </p>

                        <span className="rounded bg-[#8b78ff]/10 px-2 py-0.5 text-[9px] text-[#b6a8ff]">
                          {isOrigin
                            ? 'Primary Pickup'
                            : isDestination
                              ? 'Express Destination'
                              : 'Waypoint'}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs font-semibold text-white">
                        {point.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#929bad]">
                        {point.address}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Driver Details */}
          <section className="space-y-3 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8b78ff]">
                  HOST &amp; NAVIGATOR
                </span>
                <h2 className="text-xs font-bold text-white">Your Driver</h2>
              </div>

              <span className="text-[11px] text-[#36e0c0]">
                Member since Feb 2024
              </span>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {driver?.profilePhoto ? (
                <img
                  src={driver.profilePhoto}
                  alt={driverName}
                  className="h-14 w-14 rounded-xl border border-[#30394b] object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#202938] text-base font-bold text-white">
                  {driverName.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-white">{driverName}</h3>

                  {isDriverVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-2 py-0.5 text-[9px] font-semibold text-[#36e0c0]">
                      <BadgeCheck size={11} />
                      Verified ID
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#929bad]">
                  <span className="flex items-center gap-1 font-medium text-amber-300">
                    <Star size={11} className="fill-amber-300 text-amber-300" />
                    {driverRating.toFixed(1)}
                  </span>

                  <span>· {driverReviewCount} reviews</span>
                  <span>· {completedTrips} highway trips</span>
                </div>
                {driver?.phone && (
                  <a
                    href={`tel:${driver.phone}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-3 py-1.5 text-xs font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
                  >
                    <Phone size={13} />
                    {driver.phone}
                  </a>
                )}

                {driver?.languages?.length ? (
                  <p className="text-[11px] text-[#929bad]">
                    Languages: {driver.languages.join(', ')}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => alert('Opening chat with driver...')}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#30394b] bg-[#161b27] px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-[#202838]"
              >
                <MessageSquare size={13} className="text-[#8b78ff]" />
                Message Driver
              </button>
            </div>

            <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3 text-[11px] italic text-[#c7cddd]">
              "Daily weekend commuter traveling to Infopark Kakkanad. Calm
              driver, punctual departure. AC set at comfortable 23°C. Smooth
              highway drive along NH 66 with clean rest stop."
            </div>
          </section>

          {/* Vehicle Details */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8b78ff]">
                  HIGHWAY MACHINE
                </span>

                <h2 className="text-xs font-bold text-white">
                  {vehicle
                    ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
                    : 'Hyundai i20 Sportz (2022)'}
                </h2>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#36e0c0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
                <BadgeCheck size={12} />
                {vehicle
                  ? isVehicleVerified
                    ? 'Kerala MVD Verified'
                    : 'Verification Pending'
                  : 'Vahan Verified'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {vehicle?.vehiclePhoto ? (
                <img
                  src={vehicle.vehiclePhoto}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-28 w-full rounded-xl border border-[#252e3e] object-cover sm:w-44"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-xl border border-[#252e3e] bg-[#080b12] text-[#929bad] sm:w-44">
                  <CarFront size={32} />
                </div>
              )}

              <div className="grid w-full flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="space-y-0.5 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                  <p className="text-[9px] font-bold uppercase text-[#929bad]">
                    CLIMATE CONTROL
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Dual Blower AC
                  </p>
                  <p className="text-[10px] text-[#929bad]">
                    Pre-set at ultra 23°C throughout journey.
                  </p>
                </div>

                <div className="space-y-0.5 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                  <p className="text-[9px] font-bold uppercase text-[#929bad]">
                    REAR SPACING
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Max 2 in Rear Seat
                  </p>
                  <p className="text-[10px] text-[#929bad]">
                    Guaranteed empty middle seat.
                  </p>
                </div>

                <div className="space-y-0.5 rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                  <p className="text-[9px] font-bold uppercase text-[#929bad]">
                    TRUNK CAPACITY
                  </p>
                  <p className="text-xs font-semibold text-white">
                    Spacious Boot 311L
                  </p>
                  <p className="text-[10px] text-[#929bad]">
                    Accommodates 2 medium suitcases.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ride Preferences */}
          <section className="space-y-3 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Ride Preferences
              </h2>

              <p className="text-[10px] text-[#929bad]">
                Comfort settings and cabin rules.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Smoking', value: ride.preferences.smoking },
                { label: 'Pets', value: ride.preferences.pets },
                {
                  label: 'Seating Comfort',
                  value: ride.preferences.seatingComfort,
                },
                {
                  label: 'Climate Control',
                  value: ride.preferences.climateControl,
                },
              ].map((preference) => (
                <div
                  key={preference.label}
                  className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3"
                >
                  <p className="text-[9px] uppercase text-[#929bad]">
                    {preference.label}
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white">
                    {formatPreference(preference.value)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pickup Instructions */}
          {ride.pickupInstructions && (
            <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Pickup Instructions
              </h2>

              <p className="mt-1.5 text-xs leading-relaxed text-[#929bad]">
                {ride.pickupInstructions}
              </p>
            </section>
          )}
        </div>

        {/* Right Column: Ride Summary Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
              <div>
                <span className="text-xl font-black text-white">
                  ₹{ride.pricePerSeat}
                </span>

                <span className="text-xs text-[#929bad]"> / seat</span>
              </div>

              <span className="rounded-full border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#36e0c0]">
                {ride.availableSeats} seats left
              </span>
            </div>

            {/* Seat Counter Selector */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#929bad]">
                <span>Reserve Seats</span>
                <span>Max {ride.availableSeats} available</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-1.5">
                <button
                  type="button"
                  disabled={isBooking}
                  onClick={() =>
                    setSeatsToReserve(Math.max(1, seatsToReserve - 1))
                  }
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#1b2230] text-white hover:bg-[#252e3e] disabled:opacity-50"
                >
                  -
                </button>

                <span className="text-xs font-bold text-white">
                  {seatsToReserve} Seat{seatsToReserve > 1 ? 's' : ''}
                </span>

                <button
                  type="button"
                  disabled={isBooking || seatsToReserve >= ride.availableSeats}
                  onClick={() =>
                    setSeatsToReserve(
                      Math.min(ride.availableSeats, seatsToReserve + 1),
                    )
                  }
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#1b2230] text-white hover:bg-[#252e3e] disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 border-t border-[#252e3e] pt-3 text-xs">
              <div className="flex justify-between text-[#929bad]">
                <span>
                  Seat Contribution ({seatsToReserve} x ₹{ride.pricePerSeat})
                </span>

                <span className="font-medium text-white">
                  ₹{ride.pricePerSeat * seatsToReserve}
                </span>
              </div>

              <div className="flex justify-between text-[#929bad]">
                <span>Highway Safety &amp; Escrow</span>

                <span className="font-medium text-[#36e0c0]">
                  ₹0 (Community Free)
                </span>
              </div>

              <div className="flex justify-between border-t border-[#252e3e] pt-2 text-xs font-bold text-white">
                <span>Total Amount</span>

                <span>₹{ride.pricePerSeat * seatsToReserve}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 p-3 text-[11px] text-[#c7cddd]">
              <p className="flex items-center gap-1 font-bold text-[#36e0c0]">
                <ShieldCheck size={13} />
                Free cancellation up to 2 hours before pickup
              </p>

              <p className="text-[10px] text-[#929bad]">
                No charges until driver accepts request.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              disabled={
                isBooking ||
                ride.availableSeats === 0 ||
                ride.status !== 'scheduled'
              }
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] py-3 text-xs font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBooking ? (
                <>
                  <LoaderCircle
                    className="mr-2 inline animate-spin"
                    size={14}
                  />
                  Sending Request...
                </>
              ) : (
                '🚀 Request to Join Ride'
              )}
            </button>

            {bookingError && (
              <p role="alert" className="text-xs text-red-400">
                {bookingError}
              </p>
            )}

            <button
              type="button"
              onClick={() => alert('Opening chat with driver...')}
              className="w-full cursor-pointer rounded-xl border border-[#30394b] bg-[#161b27] py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
            >
              Message Driver before booking
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
