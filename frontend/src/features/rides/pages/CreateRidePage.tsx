import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  ArrowLeft,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';

import { getMyVehicles } from '../../vehicles/api/vehicle.api';
import type { Vehicle } from '../../vehicles/types/vehicle.types';
import { getMyProfile } from '../../user/api/profile.api';
import type { UserProfile } from '../../user/types/profile.type';
import IdentityVerificationModal from '../../identity-verification/components/IdentityVerificationModal';
import { useOfferRideGate } from '../../identity-verification/hooks/useOfferRideGate';
import type { IdentityVerificationInfo } from '../../identity-verification/types/identity-verification.types';

import LocationPicker from '../components/LocationPicker';
import { createRide } from '../api/ride.api';

import type { RideLocation, CreateRidePayload } from '../types/ride.types';

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CreateRidePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Vehicle state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleError, setVehicleError] = useState('');

  // Location state
  const [origin, setOrigin] = useState<RideLocation | null>(null);
  const [destination, setDestination] = useState<RideLocation | null>(null);
  const [stops, setStops] = useState<(RideLocation | null)[]>([]);

  // Travel details
  const [dateOfTravel, setDateOfTravel] = useState(getTodayDate());
  const [departureHour, setDepartureHour] = useState('08');
  const [departureMinute, setDepartureMinute] = useState('00');
  const [departurePeriod, setDeparturePeriod] = useState<'AM' | 'PM'>('AM');

  // Seats and price
  const [seatsOffered, setSeatsOffered] = useState(1);
  const [pricePerSeat, setPricePerSeat] = useState(350);

  // Passenger preferences
  const [acEnabled, setAcEnabled] = useState(true);
  const [maxTwoInRear, setMaxTwoInRear] = useState(true);
  const [bootLuggage, setBootLuggage] = useState(true);
  const [noSmoking, setNoSmoking] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [kidsWelcome, setKidsWelcome] = useState(false);

  // Pickup and drop-off instructions
  const [pickupDesc, setPickupDesc] = useState('');
  const [dropDesc, setDropDesc] = useState('');

  // Additional details
  const [hostNote, setHostNote] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSyncVerification = (info: IdentityVerificationInfo) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            idVerified: info.status === 'verified',
            identityVerification: info,
          }
        : prev,
    );
  };

  const verificationGate = useOfferRideGate(
    profile?.identityVerification ??
      (profile
        ? {
            status: profile.idVerified ? 'verified' : 'not_started',
            documentType: null,
            maskedDocumentNumber: null,
            expiryDate: null,
            rejectionReason: null,
            submittedAt: null,
            verifiedAt: null,
          }
        : null),
    handleSyncVerification,
  );

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      try {
        setIsLoading(true);
        setVehicleError('');

        const [userProfile, data] = await Promise.all([
          getMyProfile().catch(() => null),
          getMyVehicles(),
        ]);

        if (!isMounted) return;

        if (userProfile) {
          setProfile(userProfile);
        }

        const eligibleVehicles = data.filter(
          (vehicle) =>
            vehicle.isActive && vehicle.verificationStatus === 'approved',
        );

        setVehicles(eligibleVehicles);

        if (eligibleVehicles.length > 0) {
          setSelectedVehicleId(eligibleVehicles[0].id);
        }
      } catch (err) {
        if (!isMounted) return;

        setVehicleError(
          err instanceof Error ? err.message : 'Unable to load your vehicles.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  // Add an empty intermediate stop
  const handleAddStop = () => {
    setStops((previous) => [...previous, null]);
  };

  // Update a selected intermediate stop
  const handleStopSelect = (index: number, location: RideLocation | null) => {
    setStops((previous) =>
      previous.map((stop, stopIndex) =>
        stopIndex === index ? location : stop,
      ),
    );
  };

  // Remove an intermediate stop
  const handleRemoveStop = (index: number) => {
    setStops((previous) =>
      previous.filter((_, stopIndex) => stopIndex !== index),
    );
  };

  // Convert 12-hour time into 24-hour time
  const getDepartureTime24Hour = (): string => {
    let hour = Number(departureHour);

    if (departurePeriod === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    return `${String(hour).padStart(2, '0')}:${departureMinute}`;
  };

  // Publish ride
  const handlePublishRide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (profile && !verificationGate.isVerified) {
      verificationGate.openModal();
      return;
    }

    if (!origin) {
      setError('Please select your pickup location.');
      return;
    }

    if (!destination) {
      setError('Please select your destination.');
      return;
    }

    if (!selectedVehicleId) {
      setError('Please select an approved vehicle.');
      return;
    }

    if (!dateOfTravel) {
      setError('Please select your departure date.');
      return;
    }

    if (!departureHour || !departureMinute) {
      setError('Please select your departure time.');
      return;
    }

    if (seatsOffered < 1) {
      setError('You must offer at least one passenger seat.');
      return;
    }

    if (selectedVehicle && seatsOffered > selectedVehicle.seatCapacity - 1) {
      setError(
        'Passenger seats cannot exceed your vehicle capacity minus the driver seat.',
      );
      return;
    }

    if (pricePerSeat < 0 || !Number.isFinite(pricePerSeat)) {
      setError('Please enter a valid price per seat.');
      return;
    }

    const time24Hour = getDepartureTime24Hour();

    const departureDateTime = new Date(`${dateOfTravel}T${time24Hour}:00`);

    if (
      Number.isNaN(departureDateTime.getTime()) ||
      departureDateTime <= new Date()
    ) {
      setError('Please select a future departure date and time.');
      return;
    }

    const validStops = stops.filter(
      (stop): stop is RideLocation => stop !== null,
    );

    const locations = [origin, ...validStops, destination];

    const hasDuplicateLocations = locations.some(
      (location, index) =>
        locations.findIndex((item) => item.placeId === location.placeId) !==
        index,
    );

    if (hasDuplicateLocations) {
      setError(
        'Pickup, destination, and intermediate stops must be different.',
      );
      return;
    }

    const payload: CreateRidePayload = {
      vehicleId: selectedVehicleId,
      origin,
      destination,
      stops: validStops,
      departureTime: departureDateTime.toISOString(),
      totalSeats: seatsOffered,
      pricePerSeat,
      preferences: {
        smoking: noSmoking ? 'non-smoking' : 'smoking-allowed',
        pets: petsAllowed ? 'allowed' : 'not-allowed',
        seatingComfort: 'no-preference',
        climateControl: acEnabled ? 'ac-preferred' : 'non-ac-preferred',
      },
      ...(pickupDesc.trim() && {
        pickupInstructions: pickupDesc.trim(),
      }),
    };

    try {
      setIsSubmitting(true);

      await createRide(payload);

      navigate('/my-rides');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to publish your ride. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 font-sans text-gray-100">
      <IdentityVerificationModal
        isOpen={verificationGate.isModalOpen}
        currentVerification={profile?.identityVerification}
        onClose={verificationGate.closeModal}
        onVerified={(info) => {
          handleSyncVerification(info);
          verificationGate.closeModal();
        }}
        onStatusUpdated={handleSyncVerification}
      />

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Offer a Ride
          </h1>

          <p className="mt-1 text-xs text-[#929bad]">
            Share your journey and give others a convenient way to travel with
            you.
          </p>
        </div>
      </div>

      {/* Community Banner */}
      <div className="rounded-xl border border-[#8b78ff]/30 bg-[#8b78ff]/10 p-3.5 flex items-start gap-3">
        <Sparkles size={16} className="text-[#b6a8ff] shrink-0 mt-0.5" />

        <p className="text-xs leading-relaxed text-[#c7cddd]">
          <strong className="text-white font-medium">Ridezo Community:</strong>{' '}
          Share your journey, choose your vehicle, set available seats, and
          define your travel preferences.
        </p>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handlePublishRide}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start"
      >
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* 1. Locations */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252e3e]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                  1
                </span>

                <h2 className="text-sm font-bold text-white">
                  Where are you going?
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {/* Origin */}
              <LocationPicker
                label="ORIGIN (LEAVING FROM)"
                placeholder="Search pickup location"
                onSelect={setOrigin}
              />

              {/* Intermediate Stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                    INTERMEDIATE STOPS
                  </label>

                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8b78ff]/30 bg-[#8b78ff]/10 px-3 py-1.5 text-[10px] font-semibold text-[#b6a8ff] transition hover:bg-[#8b78ff]/20"
                  >
                    <Plus size={13} />
                    Add Stop
                  </button>
                </div>

                {stops.map((_, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <LocationPicker
                        label={`STOP ${index + 1}`}
                        placeholder="Search intermediate stop"
                        onSelect={(location) =>
                          handleStopSelect(index, location)
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      aria-label={`Remove stop ${index + 1}`}
                      className="mt-7 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {stops.length === 0 && (
                  <p className="text-[11px] text-[#657086]">
                    No intermediate stops added.
                  </p>
                )}
              </div>

              {/* Destination */}
              <LocationPicker
                label="DESTINATION (GOING TO)"
                placeholder="Search destination"
                onSelect={setDestination}
              />
            </div>
          </div>

          {/* 2. Travel Details */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252e3e]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                2
              </span>

              <h2 className="text-sm font-bold text-white">
                When are you travelling?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Date of Travel *
                </label>

                <input
                  type="date"
                  value={dateOfTravel}
                  min={getTodayDate()}
                  onChange={(event) => setDateOfTravel(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Departure Time *
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Hour */}
                  <select
                    value={departureHour}
                    onChange={(event) => setDepartureHour(event.target.value)}
                    className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                  >
                    {Array.from({ length: 12 }, (_, index) => {
                      const hour = String(index + 1).padStart(2, '0');

                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>

                  {/* Minute */}
                  <select
                    value={departureMinute}
                    onChange={(event) => setDepartureMinute(event.target.value)}
                    className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                  >
                    {Array.from({ length: 60 }, (_, index) => {
                      const minute = String(index).padStart(2, '0');

                      return (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      );
                    })}
                  </select>

                  {/* AM / PM */}
                  <select
                    value={departurePeriod}
                    onChange={(event) =>
                      setDeparturePeriod(event.target.value as 'AM' | 'PM')
                    }
                    className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#657086]">
              Choose a future date and departure time.
            </p>
          </div>

          {/* 3. Seats and Price */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252e3e]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                3
              </span>

              <h2 className="text-sm font-bold text-white">Seats & Price</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seats */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Available Passenger Seats *
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSeatsOffered(Math.max(1, seatsOffered - 1))
                    }
                    className="h-9 w-9 rounded-xl border border-[#252e3e] bg-[#080b12] text-white flex items-center justify-center hover:bg-[#1b2230]"
                  >
                    -
                  </button>

                  <span className="flex-1 text-center font-mono text-xs font-bold text-white bg-[#080b12] py-2.5 rounded-xl border border-[#252e3e]">
                    {seatsOffered}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSeatsOffered((previous) =>
                        Math.min(
                          previous + 1,
                          Math.max(1, (selectedVehicle?.seatCapacity ?? 1) - 1),
                        ),
                      )
                    }
                    disabled={
                      seatsOffered >=
                      Math.max(1, (selectedVehicle?.seatCapacity ?? 1) - 1)
                    }
                    className="h-9 w-9 rounded-xl border border-[#252e3e] bg-[#080b12] text-white flex items-center justify-center hover:bg-[#1b2230] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <p className="mt-1 text-[10px] text-[#657086]">
                  Passenger seats cannot exceed your vehicle capacity minus the
                  driver's seat.
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Price per Seat (₹) *
                </label>

                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#36e0c0]"
                  />

                  <input
                    type="number"
                    min={0}
                    value={pricePerSeat}
                    onChange={(event) =>
                      setPricePerSeat(Number(event.target.value))
                    }
                    required
                    className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#8b78ff]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Vehicle */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#252e3e]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                  4
                </span>

                <h2 className="text-sm font-bold text-white">
                  Choose your vehicle
                </h2>
              </div>

              <span className="text-[10px] text-[#36e0c0] font-medium bg-[#36e0c0]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} />
                Approved Vehicles
              </span>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Loading your vehicles...
              </div>
            ) : vehicleError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
                {vehicleError}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 space-y-2">
                <p>No approved vehicles found.</p>

                <button
                  type="button"
                  onClick={() => navigate('/vehicles/add')}
                  className="text-[#8b78ff] underline"
                >
                  Add a vehicle first
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicleId === vehicle.id;

                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#8b78ff] bg-[#8b78ff]/10 shadow-md'
                          : 'border-[#252e3e] bg-[#080b12] hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-[#1b2230] text-gray-300">
                          <Car size={20} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </p>

                          <p className="text-[10px] font-mono text-[#929bad] mt-0.5">
                            {vehicle.registrationNumber} ·{' '}
                            {vehicle.seatCapacity} Total Seats
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#36e0c0] bg-[#36e0c0]/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={11} />
                        Approved
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Preferences */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252e3e]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                5
              </span>

              <h2 className="text-sm font-bold text-white">
                Passenger Preferences
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setAcEnabled(!acEnabled)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  acEnabled
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                ❄ AC Enabled
              </button>

              <button
                type="button"
                onClick={() => setMaxTwoInRear(!maxTwoInRear)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  maxTwoInRear
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                💺 Max 2 in Rear
              </button>

              <button
                type="button"
                onClick={() => setBootLuggage(!bootLuggage)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  bootLuggage
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                🧳 Boot Luggage
              </button>

              <button
                type="button"
                onClick={() => setNoSmoking(!noSmoking)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  noSmoking
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                🚭 No Smoking
              </button>

              <button
                type="button"
                onClick={() => setPetsAllowed(!petsAllowed)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  petsAllowed
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                🐾 Pets Allowed
              </button>

              <button
                type="button"
                onClick={() => setKidsWelcome(!kidsWelcome)}
                className={`rounded-xl border p-2.5 text-xs font-medium text-left transition ${
                  kidsWelcome
                    ? 'border-[#8b78ff] bg-[#8b78ff]/15 text-white'
                    : 'border-[#252e3e] bg-[#080b12] text-[#929bad]'
                }`}
              >
                👶 Kids Welcome
              </button>
            </div>
          </div>

          {/* 6. Pickup Instructions */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252e3e]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                6
              </span>

              <h2 className="text-sm font-bold text-white">
                Pickup & Drop-off Instructions
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Pickup Instructions
                </label>

                <input
                  type="text"
                  value={pickupDesc}
                  onChange={(event) => setPickupDesc(event.target.value)}
                  placeholder="Describe your pickup point"
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                  Drop-off Instructions
                </label>

                <input
                  type="text"
                  value={dropDesc}
                  onChange={(event) => setDropDesc(event.target.value)}
                  placeholder="Describe your drop-off point"
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>
            </div>
          </div>

          {/* 7. Additional Details */}
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252e3e]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8b78ff]/15 text-xs font-bold text-[#b6a8ff]">
                7
              </span>

              <h2 className="text-sm font-bold text-white">
                Additional Details
              </h2>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#929bad] mb-1">
                Note for Co-Passengers
              </label>

              <textarea
                rows={3}
                value={hostNote}
                onChange={(event) => setHostNote(event.target.value)}
                placeholder="Add any additional information for passengers..."
                className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] p-3 text-xs text-white outline-none focus:border-[#8b78ff]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Ride Summary */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Ride Summary
              </h3>

              <span className="text-[10px] font-mono text-[#36e0c0]">
                RIDE DETAILS
              </span>
            </div>

            {/* Route */}
            <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5 space-y-2">
              <p className="text-xs font-bold text-white">
                {origin?.name ?? 'Pickup'}{' '}
                <span className="text-[#8b78ff]">→</span>{' '}
                {destination?.name ?? 'Destination'}
              </p>

              <p className="text-[10px] text-[#929bad]">
                {
                  stops.filter((stop): stop is RideLocation => stop !== null)
                    .length
                }{' '}
                intermediate stops
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#252e3e]/50 pb-2">
                <span className="text-[#929bad]">Date</span>

                <span className="font-medium text-white">
                  {dateOfTravel || 'Not selected'}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#252e3e]/50 pb-2">
                <span className="text-[#929bad]">Departure Time</span>

                <span className="font-medium text-white">
                  {departureHour}:{departureMinute} {departurePeriod}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#252e3e]/50 pb-2">
                <span className="text-[#929bad]">Passenger Seats</span>

                <span className="font-medium text-white">
                  {seatsOffered} seats
                </span>
              </div>

              <div className="flex justify-between border-b border-[#252e3e]/50 pb-2">
                <span className="text-[#929bad]">Vehicle</span>

                <span className="font-medium text-white">
                  {selectedVehicle
                    ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                    : 'Select vehicle'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-xl border border-[#8b78ff]/30 bg-[#8b78ff]/10 p-4">
              <p className="text-[10px] font-bold text-[#b6a8ff] uppercase tracking-wider">
                TOTAL PASSENGER CONTRIBUTION
              </p>

              <p className="mt-1 text-2xl font-black text-white flex items-center">
                <IndianRupee size={20} />
                {pricePerSeat * seatsOffered}
              </p>

              <p className="mt-0.5 text-[10px] text-[#929bad]">
                {seatsOffered} passenger seats × ₹{pricePerSeat} per seat
              </p>
            </div>

            {/* Inline Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || vehicles.length === 0 || isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-6 py-3.5 text-xs font-semibold text-white shadow-xl shadow-purple-950/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing Ride...' : '🚀 Publish Ride'}
            </button>

            <p className="text-[10px] text-center text-[#657086] leading-relaxed">
              Review your route, travel details, and vehicle before publishing
              your ride.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
