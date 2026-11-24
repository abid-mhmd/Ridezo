import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiStar,
  FiTruck,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

import StatusBadge from '../../components/StatusBadge';
import UserAvatar from '../../../../components/UserAvatar';
import LoadingState from '../../../../components/LoadingState';
import { cancelAdminRide, getAdminRideDetails } from '../api/admin-rides.api';
import type { AdminRideDetails } from '../types/admin-ride.types';

interface AdminRideDetailsModalProps {
  accessToken: string;
  rideId: string | null;
  onClose: () => void;
  onViewDriver: (driverId: string) => void;
  onUpdated: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function formatLabel(value?: string): string {
  if (!value) return 'Not specified';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminRideDetailsModal({
  accessToken,
  rideId,
  onClose,
  onViewDriver,
  onUpdated,
}: AdminRideDetailsModalProps) {
  const [details, setDetails] = useState<AdminRideDetails | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [prevRideId, setPrevRideId] = useState<string | null>(rideId);

  if (rideId !== prevRideId) {
    setPrevRideId(rideId);
    setDetails(null);
    setError('');
    setActionError('');
    setIsConfirmingCancel(false);
  }

  useEffect(() => {
    if (!rideId) return;

    let cancelled = false;

    getAdminRideDetails(accessToken, rideId)
      .then((data) => {
        if (!cancelled) {
          setDetails(data);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to load ride details.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rideId, accessToken]);

  useEffect(() => {
    if (!rideId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rideId, onClose]);

  if (!rideId) return null;

  const isLoading = !details && !error;

  const canCancel =
    details !== null &&
    details.status !== 'completed' &&
    details.status !== 'cancelled';

  const handleCancelRide = async () => {
    if (!details) return;

    setIsCancelling(true);
    setActionError('');

    try {
      await cancelAdminRide(accessToken, details.id);
      setIsConfirmingCancel(false);
      const refreshed = await getAdminRideDetails(accessToken, details.id);
      setDetails(refreshed);
      onUpdated();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to cancel ride.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const waypoints = details
    ? [
        { label: 'Origin Pickup', location: details.origin, type: 'origin' },
        ...details.stops.map((stop, idx) => ({
          label: `Stop ${idx + 1}`,
          location: stop,
          type: 'stop',
        })),
        {
          label: 'Final Destination',
          location: details.destination,
          type: 'destination',
        },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ride details"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#263044] bg-[#0B101B] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#263044] bg-[#080B12] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="truncate text-base font-bold text-[#F8FAFC]">
                {details
                  ? `${details.origin.name} → ${details.destination.name}`
                  : 'Ride Details'}
              </h2>
              {details && <StatusBadge status={details.status} />}
            </div>

            {details && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#707B8F]">
                <span className="font-mono text-[#A7B0C0]">
                  #{details.id.slice(-6).toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FiCalendar size={11} />
                  {formatDate(details.departureTime)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FiClock size={11} />
                  {formatTime(details.departureTime)}
                </span>
                <span className="font-semibold text-[#C37DF5]">
                  ₹{details.pricePerSeat} / seat
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#A7B0C0] transition hover:bg-[#111722] hover:text-[#F8FAFC]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="dark-scrollbar flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <LoadingState />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
              {error}
            </div>
          ) : details ? (
            <>
              {actionError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <FiAlertCircle size={15} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Seat & Fare Summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#263044] bg-[#111722]/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                    Total Seats
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                    {details.totalSeats}
                  </p>
                </div>

                <div className="rounded-xl border border-[#263044] bg-[#111722]/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                    Booked
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#C37DF5]">
                    {details.bookedSeats}
                  </p>
                </div>

                <div className="rounded-xl border border-[#263044] bg-[#111722]/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                    Available
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    {details.availableSeats}
                  </p>
                </div>

                <div className="rounded-xl border border-[#263044] bg-[#111722]/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#707B8F]">
                    Price / Seat
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                    ₹{details.pricePerSeat}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Left Column: Itinerary + Notes + Preferences */}
                <div className="space-y-5 lg:col-span-7">
                  {/* Route Itinerary */}
                  <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                        Route Itinerary
                      </p>
                      <span className="text-[11px] text-[#A7B0C0]">
                        {waypoints.length} Waypoints
                      </span>
                    </div>

                    <div className="space-y-3">
                      {waypoints.map((point, index) => (
                        <div
                          key={`${point.location.placeId}-${index}`}
                          className="relative flex gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                point.type === 'origin'
                                  ? 'border-[#C37DF5] bg-[#C37DF5]/15 text-[#C37DF5]'
                                  : point.type === 'destination'
                                    ? 'border-emerald-400 bg-emerald-400/15 text-emerald-400'
                                    : 'border-[#263044] bg-[#080B12] text-[#A7B0C0]'
                              }`}
                            >
                              {index + 1}
                            </span>
                            {index < waypoints.length - 1 && (
                              <span className="mt-1 h-full w-px bg-[#263044]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 rounded-xl border border-[#263044] bg-[#080B12] p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-[#F8FAFC]">
                                {point.location.name}
                              </p>
                              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#A7B0C0]">
                                {point.label}
                              </span>
                            </div>
                            <p className="mt-1 flex items-start gap-1 text-[11px] text-[#707B8F]">
                              <FiMapPin size={11} className="mt-0.5 shrink-0" />
                              <span>{point.location.address}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Instructions */}
                  {details.pickupInstructions && (
                    <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                        <FiFileText size={12} />
                        Driver Pickup Instructions
                      </p>
                      <p className="text-xs leading-relaxed text-[#A7B0C0]">
                        {details.pickupInstructions}
                      </p>
                    </div>
                  )}

                  {/* Ride Preferences */}
                  <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                      Comfort Settings &amp; Rules
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] text-[#707B8F]">Smoking</p>
                        <p className="mt-0.5 font-medium text-[#F8FAFC]">
                          {formatLabel(details.preferences?.smoking)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] text-[#707B8F]">Pets</p>
                        <p className="mt-0.5 font-medium text-[#F8FAFC]">
                          {formatLabel(details.preferences?.pets)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] text-[#707B8F]">
                          Seating Comfort
                        </p>
                        <p className="mt-0.5 font-medium text-[#F8FAFC]">
                          {formatLabel(details.preferences?.seatingComfort)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] text-[#707B8F]">
                          Climate Control
                        </p>
                        <p className="mt-0.5 font-medium text-[#F8FAFC]">
                          {formatLabel(details.preferences?.climateControl)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Driver + Vehicle */}
                <div className="space-y-5 lg:col-span-5">
                  {/* Driver Card */}
                  <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                      Driver Details
                    </p>

                    {details.driver ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            firstName={details.driver.firstName}
                            lastName={details.driver.lastName}
                            profilePhoto={details.driver.profilePhoto}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#F8FAFC]">
                              {details.driver.firstName}{' '}
                              {details.driver.lastName}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#A7B0C0]">
                              <span className="inline-flex items-center gap-1 text-amber-400">
                                <FiStar size={11} />
                                {details.driver.rating.toFixed(1)}
                              </span>
                              <span>·</span>
                              <span>
                                {details.driver.completedRideCount} rides
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-[#263044] bg-[#080B12] p-3 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#707B8F]">Identity</span>
                            <span className="inline-flex items-center gap-1 capitalize text-emerald-400">
                              <FiShield size={11} />
                              {details.driver.identityVerificationStatus}
                            </span>
                          </div>

                          {details.driver.email && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 text-[#707B8F]">
                                <FiMail size={11} /> Email
                              </span>
                              <span className="truncate text-[#F8FAFC]">
                                {details.driver.email}
                              </span>
                            </div>
                          )}

                          {details.driver.phone && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 text-[#707B8F]">
                                <FiPhone size={11} /> Phone
                              </span>
                              <span className="text-[#F8FAFC]">
                                {details.driver.phone}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onViewDriver(details.driver!.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#263044] bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition hover:border-[#C37DF5]/40 hover:text-[#C37DF5]"
                        >
                          <FiUser size={14} />
                          View Driver Profile
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-[#707B8F]">
                        Driver information unavailable
                      </p>
                    )}
                  </div>

                  {/* Vehicle Card */}
                  <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                        Assigned Vehicle
                      </p>
                      {details.vehicle && (
                        <StatusBadge
                          status={details.vehicle.verificationStatus}
                        />
                      )}
                    </div>

                    {details.vehicle ? (
                      <div className="space-y-3">
                        {details.vehicle.vehiclePhoto ? (
                          <img
                            src={details.vehicle.vehiclePhoto}
                            alt={`${details.vehicle.brand} ${details.vehicle.model}`}
                            className="h-36 w-full rounded-xl border border-[#263044] object-cover"
                          />
                        ) : (
                          <div className="flex h-36 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-[#263044] bg-[#080B12] text-[#707B8F]">
                            <FiTruck size={24} />
                            <span className="text-xs">No vehicle photo</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#F8FAFC]">
                              {details.vehicle.brand} {details.vehicle.model}
                            </p>
                            <p className="text-[11px] capitalize text-[#707B8F]">
                              {details.vehicle.year} · {details.vehicle.color}
                            </p>
                          </div>

                          <span className="rounded-md border border-[#263044] bg-[#F8FAFC] px-2 py-0.5 font-mono text-[11px] font-bold text-[#080B12]">
                            {details.vehicle.registrationNumber}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#707B8F]">
                        Vehicle information unavailable
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer — Admin Cancellation */}
        {details && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#263044] bg-[#080B12] px-6 py-4">
            <p className="text-[11px] text-[#707B8F]">
              Created {formatDate(details.createdAt)}
            </p>

            {canCancel ? (
              isConfirmingCancel ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-300">
                    Cancel this ride permanently?
                  </span>
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={() => setIsConfirmingCancel(false)}
                    className="rounded-xl border border-[#263044] px-3 py-1.5 text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC]"
                  >
                    Keep Ride
                  </button>
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={() => void handleCancelRide()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    <FiXCircle size={14} />
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  <FiXCircle size={15} />
                  Cancel Ride
                </button>
              )
            ) : (
              <span className="text-xs text-[#707B8F]">
                Ride is {details.status} — no further actions available
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
