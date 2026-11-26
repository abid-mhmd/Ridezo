import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CarFront,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  IndianRupee,
  LoaderCircle,
  Mail,
  Phone,
  UserRound,
  Users,
} from 'lucide-react';

import { cancelRide, getRideDetails } from '../api/ride.api';
import { getDriverBookingRequests } from '../../bookings/api/booking.api';
import type { Ride } from '../types/ride.types';
import type { Booking } from '../../bookings/types/booking-types';

function extractBookings(payload: unknown): Booking[] {
  if (Array.isArray(payload)) return payload as Booking[];
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.bookings)) return record.bookings as Booking[];
    if (Array.isArray(record.requests)) return record.requests as Booking[];
    if (Array.isArray(record.data)) return record.data as Booking[];
  }
  return [];
}

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

function getPassengerName(booking: Booking): string {
  const fullName = [
    booking.passengerSnapshot?.firstName,
    booking.passengerSnapshot?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    fullName || `Passenger #${booking.passengerId.slice(-6).toUpperCase()}`
  );
}

export default function DriverRideDetailsPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();

  const [ride, setRide] = useState<Ride | null>(null);
  const [bookedPassengers, setBookedPassengers] = useState<Booking[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchRide() {
      if (!rideId) {
        setError('Invalid ride ID.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const [rideResult, requestsResult] = await Promise.allSettled([
          getRideDetails(rideId),
          getDriverBookingRequests(1, 50),
        ]);

        if (!isMounted) return;

        if (rideResult.status === 'rejected') {
          throw rideResult.reason instanceof Error
            ? rideResult.reason
            : new Error('Unable to load ride details.');
        }

        setRide(rideResult.value);

        const allRequests =
          requestsResult.status === 'fulfilled'
            ? extractBookings(requestsResult.value)
            : [];
        const rideRequests = allRequests.filter((b) => b.rideId === rideId);

        setBookedPassengers(
          rideRequests.filter((b) => b.status === 'accepted'),
        );
        setPendingCount(
          rideRequests.filter((b) => b.status === 'pending').length,
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load ride details.',
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchRide();

    return () => {
      isMounted = false;
    };
  }, [rideId]);

  const handleCancelRide = async () => {
    if (!ride) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this ride? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      setActionError('');
      await cancelRide(ride.id);
      setRide((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to cancel ride.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-sans text-xs text-[#929bad]">
        <LoaderCircle className="mr-2 animate-spin text-[#8b78ff]" size={16} />
        Loading your ride details...
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
          onClick={() => navigate('/my-rides')}
          className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to My Rides
        </button>
      </div>
    );
  }

  const vehicle = ride.vehicle;
  const bookedSeats = ride.totalSeats - ride.availableSeats;
  const estimatedEarnings = bookedSeats * ride.pricePerSeat;
  const canManage = ride.status === 'scheduled' || ride.status === 'full';
  const isVehicleVerified = ['verified', 'approved'].includes(
    vehicle?.verificationStatus?.toLowerCase() ?? '',
  );

  const routePoints = [
    { ...ride.origin, type: 'origin' },
    ...(Array.isArray(ride.stops)
      ? ride.stops.map((stop) => ({ ...stop, type: 'stop' }))
      : []),
    { ...ride.destination, type: 'destination' },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-16 font-sans text-gray-100">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <span className="font-mono text-[11px] text-[#929bad]">
          Ride ID: #{ride.id.slice(-8).toUpperCase()}
        </span>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Full Ride Details (No Driver Card) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Route Overview Banner */}
          <section className="relative space-y-4 overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-3 py-0.5 text-[11px] font-semibold text-[#36e0c0]">
                <CheckCircle2 size={12} />
                {ride.status.toUpperCase()} · HOST VIEW
              </span>
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

            <div className="grid grid-cols-2 gap-2.5 border-t border-[#252e3e] pt-3 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Departure</p>
                <p className="mt-0.5 font-bold text-white">
                  {formatTime(ride.departureTime)}
                </p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">
                  Total Seats
                </p>
                <p className="mt-0.5 font-bold text-white">{ride.totalSeats}</p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Booked</p>
                <p className="mt-0.5 font-bold text-[#8b78ff]">{bookedSeats}</p>
              </div>

              <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-2.5">
                <p className="text-[9px] uppercase text-[#929bad]">Available</p>
                <p className="mt-0.5 font-bold text-[#36e0c0]">
                  {ride.availableSeats} left
                </p>
              </div>
            </div>
          </section>

          {/* Route & Stopovers */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="border-b border-[#252e3e] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Route &amp; Stopovers
              </h2>
              <p className="text-[10px] text-[#929bad]">
                Pickup, intermediate waypoints, and destination drop-off.
              </p>
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
                      <p className="text-[11px] font-bold text-white">
                        {isOrigin
                          ? 'Pickup Point'
                          : isDestination
                            ? 'Final Drop-off'
                            : `Stop ${index}`}
                      </p>
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

          {/* Booked Passengers */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252e3e] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#36e0c0]">
                  CONFIRMED PASSENGERS
                </span>
                <h2 className="text-xs font-bold text-white">
                  Booked Passengers ({bookedPassengers.length})
                </h2>
              </div>

              <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
                {bookedSeats} / {ride.totalSeats} seats filled
              </span>
            </div>

            {bookedPassengers.length === 0 ? (
              <p className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4 text-center text-xs text-[#929bad]">
                No confirmed passengers for this ride yet.
              </p>
            ) : (
              <div className="space-y-3">
                {bookedPassengers.map((booking) => {
                  const fullName = getPassengerName(booking);

                  return (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        {booking.passengerSnapshot?.profilePhoto ? (
                          <img
                            src={booking.passengerSnapshot.profilePhoto}
                            alt={fullName}
                            className="h-11 w-11 rounded-full border border-[#36e0c0]/30 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#36e0c0]/15 text-[#36e0c0]">
                            <UserRound size={18} />
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">
                            {fullName}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#929bad]">
                            {booking.passengerSnapshot?.phone && (
                              <a
                                href={`tel:${booking.passengerSnapshot.phone}`}
                                className="inline-flex items-center gap-1 font-medium text-[#36e0c0] hover:underline"
                              >
                                <Phone size={11} />
                                {booking.passengerSnapshot.phone}
                              </a>
                            )}
                            {booking.passengerSnapshot?.email && (
                              <a
                                href={`mailto:${booking.passengerSnapshot.email}`}
                                className="inline-flex items-center gap-1 hover:text-white"
                              >
                                <Mail size={11} />
                                {booking.passengerSnapshot.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="rounded-lg border border-[#252e3e] bg-[#111722] px-2.5 py-1 text-[11px] text-[#c7cddd]">
                          {booking.seatsRequested} seat
                          {booking.seatsRequested === 1 ? '' : 's'} · ₹
                          {booking.totalPrice.toLocaleString('en-IN')}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/bookings/${booking.id}?role=driver`)
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#36e0c0]/30 bg-[#36e0c0]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/25"
                        >
                          <Eye size={12} />
                          View Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Vehicle Details */}
          {vehicle && (
            <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8b78ff]">
                    ASSIGNED VEHICLE
                  </span>
                  <h2 className="text-xs font-bold text-white">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </h2>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#36e0c0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#36e0c0]">
                  <BadgeCheck size={12} />
                  {isVehicleVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {vehicle.vehiclePhoto ? (
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

                <div className="grid w-full flex-1 grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                    <p className="text-[9px] uppercase text-[#929bad]">
                      Registration
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-white">
                      {vehicle.registrationNumber}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
                    <p className="text-[9px] uppercase text-[#929bad]">Color</p>
                    <p className="mt-0.5 font-semibold capitalize text-white">
                      {vehicle.color}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Ride Preferences */}
          <section className="space-y-3 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl sm:p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Ride Preferences
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Smoking', value: ride.preferences?.smoking },
                { label: 'Pets', value: ride.preferences?.pets },
                {
                  label: 'Seating Comfort',
                  value: ride.preferences?.seatingComfort,
                },
                {
                  label: 'Climate Control',
                  value: ride.preferences?.climateControl,
                },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3"
                >
                  <p className="text-[9px] uppercase text-[#929bad]">
                    {pref.label}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-white">
                    {formatPreference(pref.value)}
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

        {/* Right Column: Host Summary & Controls */}
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
                {bookedSeats}/{ride.totalSeats} booked
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#929bad]">
                <span>Seats Booked</span>
                <span className="font-medium text-white">{bookedSeats}</span>
              </div>
              <div className="flex justify-between text-[#929bad]">
                <span>Seats Remaining</span>
                <span className="font-medium text-[#36e0c0]">
                  {ride.availableSeats}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#252e3e] pt-2 text-sm font-bold text-white">
                <span>Est. Earnings</span>
                <span className="flex items-center text-[#36e0c0]">
                  <IndianRupee size={14} />
                  {estimatedEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {canManage && pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/rides/${ride.id}/requests?tab=pending`)
                  }
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
                >
                  <Users size={14} />
                  Manage Ride Requests ({pendingCount})
                </button>
              )}

              {bookedPassengers.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/rides/${ride.id}/requests?tab=accepted`)
                  }
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 py-2.5 text-xs font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
                >
                  <Users size={14} />
                  View Accepted Bookings ({bookedPassengers.length})
                </button>
              )}

              {ride.status === 'scheduled' && (
                <button
                  type="button"
                  onClick={() => navigate(`/rides/${ride.id}/edit`)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#30394b] bg-[#161b27] py-2.5 text-xs font-medium text-[#c7cddd] transition hover:text-white"
                >
                  <Edit3 size={14} />
                  Edit Ride
                </button>
              )}

              {canManage && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => void handleCancelRide()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Ban size={14} />
                  {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
