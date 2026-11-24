import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Flag,
  Mail,
  Phone,
  IndianRupee,
  Route,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';

import LoadingState from '../../../components/LoadingState';
import { cancelBooking, getBookingById } from '../api/booking.api';
import type { Booking, BookingStatus } from '../types/booking-types';

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; badge: string; box: string }
> = {
  pending: {
    label: 'Awaiting Driver Approval',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    box: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  },
  accepted: {
    label: 'Booking Accepted',
    badge: 'border-[#36e0c0]/20 bg-[#36e0c0]/10 text-[#36e0c0]',
    box: 'border-[#36e0c0]/20 bg-[#36e0c0]/10 text-[#36e0c0]',
  },
  rejected: {
    label: 'Request Rejected',
    badge: 'border-red-500/20 bg-red-500/10 text-red-400',
    box: 'border-red-500/20 bg-red-500/10 text-red-300',
  },
  cancelled: {
    label: 'Booking Cancelled',
    badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
    box: 'border-gray-500/20 bg-gray-500/10 text-gray-300',
  },
  completed: {
    label: 'Ride Completed',
    badge: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
    box: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDriverName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName]
    .map((part) =>
      part && part.toLowerCase() !== 'undefined' ? part.trim() : '',
    )
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : 'Ridezo Driver';
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDriverView = searchParams.get('role') === 'driver';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookingId));
  const [error, setError] = useState(bookingId ? '' : 'Invalid booking ID.');
  const [actionError, setActionError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    let isActive = true;

    async function fetchBooking() {
      try {
        setIsLoading(true);
        setError('');
        const data = await getBookingById(bookingId!);
        if (isActive) setBooking(data);
      } catch (err: unknown) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : 'Unable to load booking.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void fetchBooking();

    return () => {
      isActive = false;
    };
  }, [bookingId]);

  const handleCancel = async () => {
    if (!booking || isDriverView) return;

    const confirmed = window.confirm(
      booking.status === 'pending'
        ? 'Cancel this booking request?'
        : 'Cancel this confirmed booking? Your reserved seats will be released.',
    );
    if (!confirmed) return;

    setIsCancelling(true);
    setActionError('');
    setPaymentNotice('');

    try {
      const updated = await cancelBooking(booking.id);
      setBooking((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to cancel booking.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!booking || isDriverView) return;
    setPaymentNotice(
      `Payment for #${booking.id.slice(-8).toUpperCase()} (₹${booking.totalPrice.toLocaleString('en-IN')}) will connect to the payment gateway in the next phase.`,
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading booking details..." />;
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#252e3e] bg-[#111722] p-8 text-center text-white">
        <p className="text-sm text-red-300">{error || 'Booking not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/my-rides')}
          className="mt-4 cursor-pointer rounded-xl bg-[#8b78ff] px-5 py-2 text-xs font-semibold text-white"
        >
          Back to My Rides
        </button>
      </div>
    );
  }

  const canCancel =
    !isDriverView &&
    (booking.status === 'pending' || booking.status === 'accepted');
  const canPay = !isDriverView && booking.status === 'accepted';
  const statusInfo = STATUS_STYLES[booking.status];
  const driverName = formatDriverName(
    booking.driverSnapshot?.firstName,
    booking.driverSnapshot?.lastName,
  );

  const StatusIcon =
    booking.status === 'accepted'
      ? CheckCircle2
      : booking.status === 'rejected'
        ? XCircle
        : booking.status === 'cancelled'
          ? Ban
          : booking.status === 'completed'
            ? Flag
            : Clock3;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-sans text-white">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/my-rides')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to My Rides
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isDriverView ? (
            <>
              <button
                type="button"
                onClick={() =>
                  navigate(`/rides/${booking.rideId}/requests?tab=accepted`)
                }
                className="cursor-pointer rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white"
              >
                All Ride Requests
              </button>
              <button
                type="button"
                onClick={() => navigate(`/rides/${booking.rideId}/host`)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#8b78ff]/40 bg-[#8b78ff]/15 px-3.5 py-2 text-xs font-semibold text-[#c7bfff] transition hover:bg-[#8b78ff]/25"
              >
                <ExternalLink size={13} />
                View Ride Details
              </button>
            </>
          ) : (
            <>
              {canPay && (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#36e0c0] to-[#2bc2a1] px-4 py-2 text-xs font-bold text-black shadow-md transition hover:opacity-90"
                >
                  <CreditCard size={14} />
                  Proceed to Payment (₹
                  {booking.totalPrice.toLocaleString('en-IN')})
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => void handleCancel()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Ban size={14} />
                  {isCancelling
                    ? 'Cancelling...'
                    : booking.status === 'pending'
                      ? 'Cancel Request'
                      : 'Cancel Booking'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#252e3e] bg-[#111722] p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold sm:text-2xl">
              {booking.rideSnapshot.origin.name} →{' '}
              {booking.rideSnapshot.destination.name}
            </h1>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${statusInfo.badge}`}
            >
              {statusInfo.label}
            </span>
            {isDriverView && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b6a8ff]">
                Host View
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-[#929bad]">
            Booking ID: #{booking.id.slice(-8).toUpperCase()} · Booked on{' '}
            {formatDate(booking.createdAt)}
          </p>
        </div>

        <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
          {booking.seatsRequested} Seat{booking.seatsRequested > 1 ? 's' : ''}
        </span>
      </div>

      {paymentNotice && (
        <div className="rounded-xl border border-[#36e0c0]/30 bg-[#36e0c0]/10 p-3.5 text-xs text-[#36e0c0]">
          {paymentNotice}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
          {actionError}
        </div>
      )}

      {/* Route */}
      <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Route className="h-4 w-4 text-purple-400" />
            Trip Itinerary
          </h2>
          <span className="rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            {formatDate(booking.rideSnapshot.departureTime)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-3 w-3 rounded-full border-2 border-purple-400 bg-purple-400/20" />
              <div className="min-h-8 w-px border-l border-dashed border-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                {formatTime(booking.rideSnapshot.departureTime)}
              </p>
              <p className="text-sm font-medium">
                {booking.rideSnapshot.origin.name}
              </p>
              <p className="text-xs text-gray-500">
                {booking.rideSnapshot.origin.address}
              </p>
            </div>
          </div>

          {booking.rideSnapshot.stops.map((stop, idx) => (
            <div key={`${stop.placeId}-${idx}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-600" />
                <div className="min-h-8 w-px border-l border-dashed border-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Stop {idx + 1}</p>
                <p className="text-sm font-medium text-gray-200">{stop.name}</p>
                <p className="text-xs text-gray-500">{stop.address}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-400" />
            <div>
              <p className="text-xs text-emerald-400">Destination</p>
              <p className="text-sm font-medium">
                {booking.rideSnapshot.destination.name}
              </p>
              <p className="text-xs text-gray-500">
                {booking.rideSnapshot.destination.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Passenger/Driver, Vehicle & Fare */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 lg:col-span-3">
          {isDriverView ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {booking.passengerSnapshot?.profilePhoto ? (
                  <img
                    src={booking.passengerSnapshot.profilePhoto}
                    alt={
                      [
                        booking.passengerSnapshot.firstName,
                        booking.passengerSnapshot.lastName,
                      ]
                        .filter(Boolean)
                        .join(' ') || 'Passenger'
                    }
                    className="h-12 w-12 rounded-full border border-[#36e0c0]/40 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#36e0c0]/15">
                    <UserRound className="h-6 w-6 text-[#36e0c0]" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold">
                    {[
                      booking.passengerSnapshot?.firstName,
                      booking.passengerSnapshot?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ') ||
                      `Passenger #${booking.passengerId.slice(-6).toUpperCase()}`}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ridezo Passenger · {booking.seatsRequested} seat
                    {booking.seatsRequested > 1 ? 's' : ''} booked
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-xl border border-[#252e3e] bg-[#080b12] p-3 text-xs sm:grid-cols-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={13} className="shrink-0 text-[#8b78ff]" />
                  {booking.passengerSnapshot?.email ? (
                    <a
                      href={`mailto:${booking.passengerSnapshot.email}`}
                      className="truncate hover:text-[#36e0c0]"
                    >
                      {booking.passengerSnapshot.email}
                    </a>
                  ) : (
                    <span className="text-gray-500">Email not provided</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={13} className="shrink-0 text-[#36e0c0]" />
                  {booking.passengerSnapshot?.phone ? (
                    <a
                      href={`tel:${booking.passengerSnapshot.phone}`}
                      className="truncate font-medium hover:text-[#36e0c0]"
                    >
                      {booking.passengerSnapshot.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500">Phone not provided</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {booking.driverSnapshot?.profilePhoto ? (
                <img
                  src={booking.driverSnapshot.profilePhoto}
                  alt={driverName}
                  className="h-12 w-12 rounded-full border border-emerald-400/30 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                  <UserRound className="h-6 w-6 text-purple-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{driverName}</h3>
                <p className="text-xs text-gray-400">Your Ride Driver</p>

                {/* ADD THIS: Driver Contact Number */}
                {booking.driverSnapshot?.phone && (
                  <a
                    href={`tel:${booking.driverSnapshot.phone}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#36e0c0]/25 bg-[#36e0c0]/10 px-2.5 py-1 text-xs font-semibold text-[#36e0c0] transition hover:bg-[#36e0c0]/20"
                  >
                    <Phone size={12} />
                    {booking.driverSnapshot.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="h-px bg-[#252e3e]" />

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CarFront className="h-4 w-4 text-purple-400" />
              Vehicle Information
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              {booking.vehicleSnapshot?.vehiclePhoto && (
                <img
                  src={booking.vehicleSnapshot.vehiclePhoto}
                  alt="Vehicle"
                  className="h-24 w-full rounded-lg object-cover sm:w-32"
                />
              )}
              <div className="grid flex-1 grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Vehicle</p>
                  <p className="mt-0.5 font-medium">
                    {booking.vehicleSnapshot.brand}{' '}
                    {booking.vehicleSnapshot.model}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Year</p>
                  <p className="mt-0.5">{booking.vehicleSnapshot.year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Color</p>
                  <p className="mt-0.5 capitalize">
                    {booking.vehicleSnapshot.color}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Registration</p>
                  <p className="mt-0.5 font-mono">
                    {booking.vehicleSnapshot.registrationNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {booking.rideSnapshot.pickupInstructions && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
              <p className="text-xs font-medium text-purple-300">
                Pickup Instructions
              </p>
              <p className="mt-1 text-xs text-gray-300">
                {booking.rideSnapshot.pickupInstructions}
              </p>
            </div>
          )}

          {booking.message && (
            <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3">
              <p className="text-xs font-medium text-gray-400">
                {isDriverView ? 'Passenger Message' : 'Your Message'}
              </p>
              <p className="mt-1 text-xs text-gray-300">{booking.message}</p>
            </div>
          )}
        </div>

        {/* Fare Summary */}
        <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 lg:col-span-2">
          <h3 className="font-semibold">
            {isDriverView ? 'Passenger Fare Summary' : 'Booking Summary'}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Price per seat</span>
              <span>₹{booking.pricePerSeat.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                {isDriverView ? 'Seats booked' : 'Seats requested'}
              </span>
              <span className="text-emerald-400">{booking.seatsRequested}</span>
            </div>
            <div className="h-px bg-[#252e3e]" />
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Total Amount</span>
              <span className="flex items-center text-lg">
                <IndianRupee className="h-4 w-4" />
                {booking.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className={`rounded-xl border p-3 text-xs ${statusInfo.box}`}>
            <div className="flex items-start gap-2">
              <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {booking.status === 'pending' &&
                  (isDriverView
                    ? 'This seat request is awaiting your approval.'
                    : 'Waiting for the driver to review your request.')}
                {booking.status === 'accepted' &&
                  (isDriverView
                    ? 'You approved this booking. Seats are reserved for this passenger.'
                    : 'Approved by driver. Ready for payment to lock in your confirmed ride.')}
                {booking.status === 'rejected' &&
                  (booking.rejectionReason ||
                    'This booking request was declined.')}
                {booking.status === 'cancelled' &&
                  'This booking has been cancelled.'}
                {booking.status === 'completed' &&
                  'This journey has been completed.'}
              </p>
            </div>
          </div>

          {canPay && (
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <CreditCard size={14} />
              Pay ₹{booking.totalPrice.toLocaleString('en-IN')}
            </button>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-[11px] text-gray-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
            <span>
              {isDriverView
                ? 'Verify the passenger reference and seat count at pickup.'
                : 'Always verify vehicle details and pickup spot before boarding.'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
