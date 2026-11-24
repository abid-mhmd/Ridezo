import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
  Flag,
  MapPin,
  CarFront,
  UserRound,
  ShieldCheck,
  ArrowRight,
  IndianRupee,
  Info,
  Route,
  type LucideIcon,
} from 'lucide-react';

import type { Booking, BookingStatus } from '../types/booking-types';

interface BookingSuccessLocationState {
  booking?: Booking;
}

interface StatusConfig {
  title: string;
  description: string;
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
  border: string;
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    title: 'Request Submitted!',
    description:
      'Your booking request has been sent to the driver. We will notify you once the driver responds.',
    label: 'Awaiting Driver Approval',
    icon: Clock3,
    color: 'text-yellow-400',
    background: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  accepted: {
    title: 'Booking Accepted!',
    description:
      'Great news! The driver has accepted your booking request. Your seat is confirmed.',
    label: 'Booking Accepted',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    background: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  rejected: {
    title: 'Booking Rejected',
    description:
      'Unfortunately, the driver could not accept your booking request.',
    label: 'Request Rejected',
    icon: XCircle,
    color: 'text-red-400',
    background: 'bg-red-400/10',
    border: 'border-red-400/20',
  },
  cancelled: {
    title: 'Booking Cancelled',
    description:
      'This booking is no longer active. You can explore other available rides.',
    label: 'Booking Cancelled',
    icon: Ban,
    color: 'text-gray-400',
    background: 'bg-gray-400/10',
    border: 'border-gray-400/20',
  },
  completed: {
    title: 'Ride Completed!',
    description:
      'Your journey has been completed. Thank you for choosing Ridezo!',
    label: 'Ride Completed',
    icon: Flag,
    color: 'text-cyan-400',
    background: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as BookingSuccessLocationState | null;
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Info className="mx-auto h-12 w-12 text-gray-500" />

          <h1 className="mt-4 text-2xl font-semibold text-white">
            Booking details unavailable
          </h1>

          <p className="mt-3 text-gray-400">
            We couldn't find your booking details. You can check your bookings
            from My Rides.
          </p>

          <button
            onClick={() => navigate('/my-rides')}
            className="mt-6 rounded-xl bg-[#c45bea] px-6 py-3 font-medium text-white transition hover:bg-[#d276ef]"
          >
            Go to My Rides
          </button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  const departureDate = booking.rideSnapshot.departureTime;

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ================= HEADER ================= */}

        <section className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${status.background} ring-1 ring-white/10 shadow-lg`}
          >
            <StatusIcon className={`h-7 w-7 ${status.color}`} />
          </div>

          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            {status.title}
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-400">
            {status.description}
          </p>

          {/* Status Badges */}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${status.border} ${status.background} ${status.color}`}
            >
              {status.label}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400">
              Booking ID: {booking.id.slice(-8).toUpperCase()}
            </span>

            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
              {booking.seatsRequested} Seat
              {booking.seatsRequested > 1 ? 's' : ''} Requested
            </span>
          </div>
        </section>

        {/* ================= YOUR TRIP ================= */}

        <section className="rounded-xl border border-[#283244] bg-[#111722] p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Route className="h-4 w-4 text-purple-400" />
              Your Trip
            </h2>

            <span className="rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
              {formatDate(departureDate)}
            </span>
          </div>

          <div className="space-y-5">
            {/* Origin */}

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="mt-1 h-3 w-3 rounded-full border-2 border-purple-400 bg-purple-400/20" />

                <div className="min-h-10 w-px border-l border-dashed border-gray-600" />
              </div>

              <div className="flex-1 pb-2">
                <p className="text-xs text-gray-400">
                  {formatTime(departureDate)}
                </p>

                <h3 className="mt-1 font-medium text-white">
                  {booking.rideSnapshot.origin.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {booking.rideSnapshot.origin.address}
                </p>
              </div>
            </div>

            {/* Stops */}

            {booking.rideSnapshot.stops.map((stop, index) => (
              <div key={`${stop.placeId}-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full border border-gray-500 bg-gray-700" />

                  <div className="min-h-10 w-px border-l border-dashed border-gray-600" />
                </div>

                <div className="flex-1 pb-2">
                  <p className="text-xs text-gray-500">Stop {index + 1}</p>

                  <h3 className="mt-1 text-sm font-medium text-gray-200">
                    {stop.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">{stop.address}</p>
                </div>
              </div>
            ))}

            {/* Destination */}

            <div className="flex gap-4">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />

              <div className="flex-1">
                <p className="text-xs text-emerald-400">Destination</p>

                <h3 className="mt-1 font-medium text-white">
                  {booking.rideSnapshot.destination.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {booking.rideSnapshot.destination.address}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DRIVER & BOOKING SUMMARY ================= */}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Driver and Vehicle */}

          <div className="space-y-4 rounded-xl border border-[#283244] bg-[#111722] p-5 lg:col-span-3">
            {/* Driver */}

            <div className="flex items-center gap-3">
              {booking.driverSnapshot.profilePhoto ? (
                <img
                  src={booking.driverSnapshot.profilePhoto}
                  alt="Driver"
                  className="h-12 w-12 rounded-full border border-emerald-400/30 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                  <UserRound className="h-6 w-6 text-purple-400" />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-white">
                  {booking.driverSnapshot.firstName}{' '}
                  {booking.driverSnapshot.lastName}
                </h3>

                <p className="mt-1 text-xs text-gray-400">Your Ride Driver</p>
              </div>

              <span className="ml-auto rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                Ridezo Driver
              </span>
            </div>

            <div className="h-px bg-[#283244]" />

            {/* Vehicle */}

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <CarFront className="h-4 w-4 text-purple-400" />
                Vehicle Information
              </h3>

              <div className="flex flex-col gap-4 sm:flex-row">
                {booking.vehicleSnapshot.vehiclePhoto && (
                  <img
                    src={booking.vehicleSnapshot.vehiclePhoto}
                    alt="Vehicle"
                    className="h-28 w-full rounded-lg object-cover sm:w-36"
                  />
                )}

                <div className="grid flex-1 grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {booking.vehicleSnapshot.brand}{' '}
                      {booking.vehicleSnapshot.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="mt-1 text-sm text-white">
                      {booking.vehicleSnapshot.year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="mt-1 text-sm text-white">
                      {booking.vehicleSnapshot.color}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="mt-1 text-sm text-white">
                      {booking.vehicleSnapshot.registrationNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Instructions */}

            {booking.rideSnapshot.pickupInstructions && (
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                <p className="text-xs font-medium text-purple-300">
                  Pickup Instructions
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  {booking.rideSnapshot.pickupInstructions}
                </p>
              </div>
            )}

            {/* Passenger Message */}

            {booking.message && (
              <div className="rounded-lg border border-[#283244] bg-black/20 p-3">
                <p className="text-xs font-medium text-gray-400">
                  Your Message to Driver
                </p>

                <p className="mt-2 text-sm text-gray-300">{booking.message}</p>
              </div>
            )}
          </div>

          {/* Booking Summary */}

          <div className="rounded-xl border border-[#283244] bg-[#111722] p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Booking Summary</h3>

              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                {status.label}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per seat</span>
                <span className="text-white">
                  ₹{booking.pricePerSeat.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Seats requested</span>
                <span className="text-emerald-400">
                  {booking.seatsRequested}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking date</span>
                <span className="text-white">
                  {formatDate(booking.createdAt)}
                </span>
              </div>

              <div className="h-px bg-[#283244]" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Total Amount
                </span>

                <span className="flex items-center text-xl font-bold text-white">
                  <IndianRupee className="h-4 w-4" />
                  {booking.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div
                className={`rounded-lg border p-3 ${status.border} ${status.background}`}
              >
                <div className="flex items-start gap-2">
                  <StatusIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${status.color}`}
                  />

                  <p className={`text-xs ${status.color}`}>
                    {booking.status === 'pending' &&
                      'Your booking request is waiting for driver approval. No payment is required now.'}

                    {booking.status === 'accepted' &&
                      'Your booking has been accepted by the driver. Payment integration will be available in a future update.'}

                    {booking.status === 'rejected' &&
                      (booking.rejectionReason ||
                        'The driver has rejected your booking request.')}

                    {booking.status === 'cancelled' &&
                      'This booking has been cancelled and is no longer active.'}

                    {booking.status === 'completed' &&
                      'Your ride has been completed successfully.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHAT HAPPENS NEXT ================= */}

        <section className="rounded-xl border border-[#283244] bg-[#111722] p-5">
          <h2 className="mb-5 flex items-center gap-2 font-semibold">
            <Flag className="h-4 w-4 text-purple-400" />
            What Happens Next
          </h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              {
                step: 'STEP 01',
                title: 'Booking Status',
                description:
                  booking.status === 'pending'
                    ? 'Your request is waiting for the driver to review and approve.'
                    : booking.status === 'accepted'
                      ? 'Your driver has accepted your booking request.'
                      : booking.status === 'rejected'
                        ? 'Your booking request was not accepted by the driver.'
                        : booking.status === 'cancelled'
                          ? 'Your booking is cancelled and no longer active.'
                          : 'Your journey has been successfully completed.',
              },
              {
                step: 'STEP 02',
                title: 'Stay Connected',
                description:
                  'Keep an eye on your booking status and stay updated about your trip.',
              },
              {
                step: 'STEP 03',
                title: 'Prepare for Your Ride',
                description:
                  'Check your departure details and coordinate with your driver before travelling.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-lg border border-[#283244] bg-[#151e2b] p-4"
              >
                <p className="text-xs font-semibold text-purple-400">
                  {item.step}
                </p>

                <h3 className="mt-2 text-sm font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ACTION BUTTONS ================= */}

        <section className="flex flex-wrap justify-center gap-3">
          <Link
            to="/my-rides"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-90"
          >
            View My Rides
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/home"
            className="flex items-center gap-2 rounded-lg border border-[#283244] bg-[#151e2b] px-5 py-3 text-sm text-gray-300 transition hover:bg-[#202b3b]"
          >
            <MapPin className="h-4 w-4" />
            Back to Home
          </Link>
        </section>

        {/* ================= SAFETY INFORMATION ================= */}

        <section className="flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="rounded-lg bg-purple-500/10 p-2">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Your Safety Matters
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-400">
              Always verify your driver's and vehicle's details before starting
              your journey. Share your trip details with someone you trust.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
