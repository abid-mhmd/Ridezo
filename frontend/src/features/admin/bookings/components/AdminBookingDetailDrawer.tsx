import { useEffect } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiX,
} from 'react-icons/fi';

import StatusBadge from '../../components/StatusBadge';
import UserAvatar from '../../../../components/UserAvatar';
import type { AdminBookingListItem } from '../types/admin-booking.types';

interface AdminBookingDetailDrawerProps {
  booking: AdminBookingListItem | null;
  onClose: () => void;
  onViewUser: (userId: string) => void;
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function AdminBookingDetailDrawer({
  booking,
  onClose,
  onViewUser,
}: AdminBookingDetailDrawerProps) {
  useEffect(() => {
    if (!booking) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [booking, onClose]);

  if (!booking) return null;

  const bookingRef = `#BKG-${booking.id.slice(-6).toUpperCase()}`;
  const rideRef = `#RD-${booking.rideId.slice(-6).toUpperCase()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Booking ${bookingRef} details`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#263044] bg-[#0B0F19] text-[#F8FAFC] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#263044] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-sm font-bold text-[#F8FAFC]">
              Booking {bookingRef}
            </h2>
            <StatusBadge status={booking.status} />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="rounded-lg p-1.5 text-[#707B8F] transition hover:bg-white/5 hover:text-[#F8FAFC]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3.5 p-5">
          {/* Ride & Route */}
          <section className="space-y-2 rounded-xl border border-[#263044] bg-[#111722] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[#F8FAFC]">
                <span className="truncate">{booking.ride.origin.name}</span>
                <FiArrowRight className="shrink-0 text-[#C37DF5]" size={14} />
                <span className="truncate">
                  {booking.ride.destination.name}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#A7B0C0]">
                  <FiCalendar size={12} className="text-[#707B8F]" />
                  {formatDateTime(booking.ride.departureTime)}
                </span>
                <span className="font-mono font-semibold text-[#C37DF5]">
                  {rideRef}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-[#263044] pt-2 text-xs text-[#A7B0C0] sm:grid-cols-2">
              <p className="flex items-start gap-2">
                <FiMapPin
                  size={13}
                  className="mt-0.5 shrink-0 text-[#34D399]"
                />
                <span className="line-clamp-1">
                  {booking.ride.origin.address}
                </span>
              </p>

              <p className="flex items-start gap-2">
                <FiMapPin
                  size={13}
                  className="mt-0.5 shrink-0 text-[#C37DF5]"
                />
                <span className="line-clamp-1">
                  {booking.ride.destination.address}
                </span>
              </p>
            </div>
          </section>

          {/* Commuters & Fare Breakdown Side-by-Side */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-5">
            {/* Commuters */}
            <section className="space-y-1.5 md:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                Commuters
              </p>

              <div className="divide-y divide-[#263044] rounded-xl border border-[#263044] bg-[#111722]">
                {/* Passenger */}
                <div className="flex items-center justify-between gap-2.5 p-3">
                  {booking.passenger ? (
                    <>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <UserAvatar
                          firstName={booking.passenger.firstName}
                          lastName={booking.passenger.lastName ?? ''}
                          profilePhoto={booking.passenger.profilePhoto}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                            {booking.passenger.firstName}{' '}
                            {booking.passenger.lastName ?? ''}{' '}
                            <span className="font-normal text-[#707B8F]">
                              (Passenger)
                            </span>
                          </p>

                          <p className="flex items-center gap-1 truncate text-[11px] text-[#707B8F]">
                            <FiMail size={10} className="shrink-0" />
                            <span className="truncate">
                              {booking.passenger.email}
                            </span>
                          </p>

                          {booking.passenger.phone && (
                            <p className="flex items-center gap-1 truncate text-[11px] text-[#707B8F]">
                              <FiPhone size={10} className="shrink-0" />
                              <span>{booking.passenger.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onViewUser(booking.passenger!.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-2.5 py-1.5 text-[11px] font-medium text-[#A7B0C0] transition hover:border-[#C37DF5]/40 hover:text-[#F8FAFC]"
                      >
                        User Record
                        <FiExternalLink size={11} />
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-[#707B8F]">
                      Passenger information unavailable
                    </p>
                  )}
                </div>

                {/* Driver */}
                <div className="flex items-center justify-between gap-2.5 p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserAvatar
                      firstName={booking.driver.firstName}
                      lastName={booking.driver.lastName}
                      profilePhoto={booking.driver.profilePhoto}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                        {booking.driver.firstName} {booking.driver.lastName}{' '}
                        <span className="font-normal text-[#707B8F]">
                          (Driver)
                        </span>
                      </p>

                      {booking.driver.email && (
                        <p className="flex items-center gap-1 truncate text-[11px] text-[#707B8F]">
                          <FiMail size={10} className="shrink-0" />
                          <span className="truncate">
                            {booking.driver.email}
                          </span>
                        </p>
                      )}

                      {booking.driver.phone && (
                        <p className="flex items-center gap-1 truncate text-[11px] text-[#707B8F]">
                          <FiPhone size={10} className="shrink-0" />
                          <span>{booking.driver.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {booking.driver.id && (
                    <button
                      type="button"
                      onClick={() => onViewUser(booking.driver.id)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12] px-2.5 py-1.5 text-[11px] font-medium text-[#A7B0C0] transition hover:border-[#C37DF5]/40 hover:text-[#F8FAFC]"
                    >
                      Driver Record
                      <FiExternalLink size={11} />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Fare Breakdown */}
            <section className="flex flex-col space-y-1.5 md:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                Fare Breakdown
              </p>

              <div className="flex flex-1 flex-col justify-between rounded-xl border border-[#263044] bg-[#111722] p-3.5 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[#A7B0C0]">
                    <span>Price / seat</span>
                    <span className="font-medium text-[#F8FAFC]">
                      ₹{booking.pricePerSeat.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#A7B0C0]">
                    <span>Seats</span>
                    <span className="font-medium text-[#F8FAFC]">
                      {booking.seatsRequested}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#263044] pt-2.5">
                  <span className="font-semibold text-[#F8FAFC]">
                    Total Fare
                  </span>
                  <span className="text-sm font-bold text-[#C37DF5]">
                    ₹{booking.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Vehicle Details */}
          <section className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
              Vehicle Details
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263044] bg-[#111722] p-3">
              <div className="flex min-w-0 items-center gap-3">
                {booking.vehicle.vehiclePhoto ? (
                  <img
                    src={booking.vehicle.vehiclePhoto}
                    alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                    className="h-12 w-16 shrink-0 rounded-lg border border-[#263044] object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[#263044] bg-[#080B12] text-[#707B8F]">
                    <FiTruck size={18} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                    {booking.vehicle.brand} {booking.vehicle.model}{' '}
                    <span className="font-normal text-[#707B8F]">
                      ({booking.vehicle.year})
                    </span>
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#A7B0C0]">
                    <span className="font-mono text-[#F8FAFC]">
                      {booking.vehicle.registrationNumber}
                    </span>
                    <span className="text-[#707B8F]">·</span>
                    <span className="capitalize">{booking.vehicle.color}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled
                title="Admin vehicle records view coming soon"
                className="inline-flex shrink-0 cursor-not-allowed items-center gap-1 rounded-lg border border-[#263044] bg-[#080B12]/60 px-2.5 py-1.5 text-[11px] font-medium text-[#707B8F] opacity-60"
              >
                Vehicle Record
                <FiExternalLink size={11} />
              </button>
            </div>
          </section>

          {/* Horizontal Booking Timeline */}
          <section className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
              Booking Timeline
            </p>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#263044] bg-[#111722] p-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#34D399]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    Submitted
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#707B8F]">
                    <FiClock size={11} className="shrink-0" />
                    <span className="truncate">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C37DF5]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold capitalize text-[#F8FAFC]">
                    Status: {booking.status}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#707B8F]">
                    <FiClock size={11} className="shrink-0" />
                    <span className="truncate">
                      {formatDateTime(booking.updatedAt)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full border border-[#707B8F]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    Departure
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#707B8F]">
                    <FiClock size={11} className="shrink-0" />
                    <span className="truncate">
                      {formatDateTime(booking.ride.departureTime)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
