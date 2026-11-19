import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, ArrowRight, CalendarDays } from 'lucide-react';
import type { Booking } from '../types/booking-types';

interface BookingSuccessLocationState {
  booking?: Booking;
}

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as BookingSuccessLocationState | null;
  const booking = state?.booking;

  // Navigation state is lost on a direct page refresh.
  if (!booking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-white">
            Booking details unavailable
          </h1>

          <p className="mt-3 text-gray-400">
            We couldn't find the booking details. You can check your booking
            requests from My Rides.
          </p>

          <button
            onClick={() => navigate('/my-rides')}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            Go to My Rides
          </button>
        </div>
      </div>
    );
  }

  const departureDate = new Date(booking.rideSnapshot.departureTime);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl sm:p-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-9 w-9 text-green-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Request submitted!
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your booking request has been sent to the driver. You'll be notified
            once the driver responds.
          </p>
        </div>

        {/* Booking Status */}
        <div className="mt-7 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <Clock3 className="h-6 w-6 shrink-0 text-yellow-400" />

          <div>
            <p className="font-medium text-yellow-400">
              Awaiting driver approval
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Your request is currently pending.
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mt-7">
          <h2 className="text-lg font-semibold text-white">Booking details</h2>

          <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <p className="text-xs text-gray-500">Route</p>
              <p className="mt-1 font-medium text-white">
                {booking.rideSnapshot.origin.name}
                <span className="mx-2 text-gray-500">→</span>
                {booking.rideSnapshot.destination.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gray-400" />

              <div>
                <p className="text-xs text-gray-500">Departure</p>
                <p className="mt-1 text-sm text-white">
                  {departureDate.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-gray-500">Seats requested</p>
                <p className="mt-1 font-medium text-white">
                  {booking.seatsRequested}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Total amount</p>
                <p className="mt-1 font-semibold text-white">
                  ₹{booking.totalPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <p className="mt-5 text-center text-sm text-gray-400">
          No payment is required now. You can proceed with payment after the
          driver accepts your request.
        </p>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/my-rides"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            View My Rides
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/home"
            className="flex flex-1 items-center justify-center rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
