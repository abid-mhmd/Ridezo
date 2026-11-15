import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Plus, Trash2, Loader2 } from 'lucide-react';

import LocationPicker from '../components/LocationPicker';

import { getRideDetails, updateRide } from '../api/ride.api';

import type {
  Ride,
  RideLocation,
  UpdateRidePayload,
  RidePreferences,
} from '../types/ride.types';

// Convert a Date into local date format: YYYY-MM-DD
function getLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Convert an existing ISO departure time into local form values.
function getLocalDateTime(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return {
      date: '',
      time: '',
    };
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    date: getLocalDate(date),
    time: `${hours}:${minutes}`,
  };
}

export default function EditRidePage() {
  const navigate = useNavigate();
  const { rideId } = useParams<{ rideId: string }>();

  // Ride loading state
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // Location state
  const [origin, setOrigin] = useState<RideLocation | null>(null);
  const [destination, setDestination] = useState<RideLocation | null>(null);
  const [stops, setStops] = useState<(RideLocation | null)[]>([]);

  // Departure state
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  // Price state
  const [pricePerSeat, setPricePerSeat] = useState(0);

  // Preference state
  const [smoking, setSmoking] =
    useState<NonNullable<RidePreferences['smoking']>>('non-smoking');

  const [pets, setPets] =
    useState<NonNullable<RidePreferences['pets']>>('not-allowed');

  const [seatingComfort, setSeatingComfort] =
    useState<NonNullable<RidePreferences['seatingComfort']>>('no-preference');

  const [climateControl, setClimateControl] =
    useState<NonNullable<RidePreferences['climateControl']>>('no-preference');

  // Pickup instructions
  const [pickupInstructions, setPickupInstructions] = useState('');

  // Fetch existing ride
  useEffect(() => {
    let isMounted = true;

    const fetchRide = async () => {
      if (!rideId) {
        setError('Invalid ride ID.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await getRideDetails(rideId);

        if (!isMounted) return;

        // Only scheduled rides can be edited.
        if (data.status !== 'scheduled') {
          setError('Only scheduled rides can be edited.');
          return;
        }

        setRide(data);

        // Populate locations
        setOrigin(data.origin);
        setDestination(data.destination);
        setStops(data.stops ?? []);

        // Populate departure date and time
        const localDateTime = getLocalDateTime(data.departureTime);

        setDepartureDate(localDateTime.date);
        setDepartureTime(localDateTime.time);

        // Populate price
        setPricePerSeat(data.pricePerSeat);

        // Populate preferences
        setSmoking(data.preferences?.smoking ?? 'non-smoking');
        setPets(data.preferences?.pets ?? 'not-allowed');

        setSeatingComfort(data.preferences?.seatingComfort ?? 'no-preference');

        setClimateControl(data.preferences?.climateControl ?? 'no-preference');

        // Populate pickup instructions
        setPickupInstructions(data.pickupInstructions ?? '');
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error ? err.message : 'Unable to load ride details.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRide();

    return () => {
      isMounted = false;
    };
  }, [rideId]);

  // Add an intermediate stop
  const handleAddStop = () => {
    if (stops.length >= 10) {
      setError('You can add a maximum of 10 intermediate stops.');
      return;
    }

    setStops((previous) => [...previous, null]);
  };

  // Update an intermediate stop
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

  // Submit updated ride
  const handleUpdateRide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!rideId || !ride) {
      setError('Ride details are unavailable.');
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

    if (origin.placeId === destination.placeId) {
      setError('Origin and destination must be different.');
      return;
    }

    if (!departureDate || !departureTime) {
      setError('Please select your departure date and time.');
      return;
    }

    if (!Number.isFinite(pricePerSeat) || pricePerSeat < 0) {
      setError('Please enter a valid price per seat.');
      return;
    }

    const departureDateTime = new Date(`${departureDate}T${departureTime}:00`);

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

    const payload: UpdateRidePayload = {
      origin,
      destination,
      stops: validStops,
      departureTime: departureDateTime.toISOString(),
      pricePerSeat,
      preferences: {
        smoking,
        pets,
        seatingComfort,
        climateControl,
      },
      pickupInstructions: pickupInstructions.trim(),
    };

    try {
      setIsSubmitting(true);

      await updateRide(rideId, payload);

      navigate('/my-rides', {
        state: {
          message: 'Ride updated successfully.',
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update ride. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-300">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading ride details...
      </div>
    );
  }

  // Error or unavailable ride
  if (!ride) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-[#111722] p-8 text-center">
        <p className="text-sm text-red-400">{error || 'Ride not found.'}</p>

        <button
          type="button"
          onClick={() => navigate('/my-rides')}
          className="mt-5 rounded-xl bg-[#8b78ff] px-5 py-2.5 text-xs font-semibold text-white"
        >
          Back to My Rides
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 font-sans text-gray-100">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/my-rides')}
        className="inline-flex items-center gap-2 text-xs text-[#929bad] transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to My Rides
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit Your Ride
        </h1>

        <p className="mt-1 text-xs text-[#929bad]">
          Update your route, departure time, price and passenger preferences.
        </p>
      </div>

      {/* Ride information */}
      <div className="rounded-xl border border-[#8b78ff]/30 bg-[#8b78ff]/10 p-4">
        <p className="text-xs text-[#c7cddd]">
          You are editing a scheduled ride. Your vehicle and passenger seat
          capacity cannot be changed.
        </p>
      </div>

      <form
        onSubmit={handleUpdateRide}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
      >
        {/* Main form */}
        <div className="space-y-6 lg:col-span-8">
          {/* Locations */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <h2 className="border-b border-[#252e3e] pb-3 text-sm font-bold text-white">
              Route Details
            </h2>

            <LocationPicker
              label="ORIGIN"
              placeholder="Search pickup location"
              value={origin}
              onSelect={setOrigin}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  INTERMEDIATE STOPS
                </label>

                <button
                  type="button"
                  onClick={handleAddStop}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#8b78ff]/30 bg-[#8b78ff]/10 px-3 py-1.5 text-[10px] font-semibold text-[#b6a8ff] hover:bg-[#8b78ff]/20"
                >
                  <Plus size={13} />
                  Add Stop
                </button>
              </div>

              {stops.map((stop, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <LocationPicker
                      label={`STOP ${index + 1}`}
                      placeholder="Search intermediate stop"
                      value={stop}
                      onSelect={(location) => handleStopSelect(index, location)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    aria-label={`Remove stop ${index + 1}`}
                    className="mt-7 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-400 hover:bg-red-500/20"
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

            <LocationPicker
              label="DESTINATION"
              placeholder="Search destination"
              value={destination}
              onSelect={setDestination}
            />
          </section>

          {/* Departure */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <h2 className="border-b border-[#252e3e] pb-3 text-sm font-bold text-white">
              Departure Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Departure Date
                </label>

                <input
                  type="date"
                  value={departureDate}
                  min={getLocalDate(new Date())}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Departure Time
                </label>

                <input
                  type="time"
                  value={departureTime}
                  onChange={(event) => setDepartureTime(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>
            </div>
          </section>

          {/* Price */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <h2 className="border-b border-[#252e3e] pb-3 text-sm font-bold text-white">
              Price Details
            </h2>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                Price Per Seat (₹)
              </label>

              <div className="relative">
                <IndianRupee
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#36e0c0]"
                />

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricePerSeat}
                  onChange={(event) =>
                    setPricePerSeat(Number(event.target.value))
                  }
                  required
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#8b78ff]"
                />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <h2 className="border-b border-[#252e3e] pb-3 text-sm font-bold text-white">
              Passenger Preferences
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Smoking
                </label>

                <select
                  value={smoking}
                  onChange={(event) =>
                    setSmoking(
                      event.target.value as NonNullable<
                        RidePreferences['smoking']
                      >,
                    )
                  }
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                >
                  <option value="non-smoking">Non-smoking</option>
                  <option value="smoking-allowed">Smoking allowed</option>
                  <option value="no-preference">No preference</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Pets
                </label>

                <select
                  value={pets}
                  onChange={(event) =>
                    setPets(
                      event.target.value as NonNullable<
                        RidePreferences['pets']
                      >,
                    )
                  }
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                >
                  <option value="allowed">Pets allowed</option>
                  <option value="not-allowed">Pets not allowed</option>
                  <option value="no-preference">No preference</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Seating Comfort
                </label>

                <select
                  value={seatingComfort}
                  onChange={(event) =>
                    setSeatingComfort(
                      event.target.value as NonNullable<
                        RidePreferences['seatingComfort']
                      >,
                    )
                  }
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                >
                  <option value="no-preference">No preference</option>
                  <option value="window">Window</option>
                  <option value="middle">Middle</option>
                  <option value="aisle">Aisle</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                  Climate Control
                </label>

                <select
                  value={climateControl}
                  onChange={(event) =>
                    setClimateControl(
                      event.target.value as NonNullable<
                        RidePreferences['climateControl']
                      >,
                    )
                  }
                  className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] px-3 py-2.5 text-xs text-white outline-none focus:border-[#8b78ff]"
                >
                  <option value="no-preference">No preference</option>
                  <option value="ac-preferred">AC preferred</option>
                  <option value="non-ac-preferred">Non-AC preferred</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pickup instructions */}
          <section className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-6">
            <h2 className="border-b border-[#252e3e] pb-3 text-sm font-bold text-white">
              Pickup Instructions
            </h2>

            <textarea
              rows={4}
              value={pickupInstructions}
              onChange={(event) => setPickupInstructions(event.target.value)}
              placeholder="Describe your pickup point or provide additional instructions..."
              className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] p-3 text-xs text-white outline-none focus:border-[#8b78ff]"
            />
          </section>
        </div>

        {/* Summary and submit */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-xl">
            <h2 className="border-b border-[#252e3e] pb-3 text-xs font-bold uppercase tracking-wider text-white">
              Ride Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[#929bad]">Origin</p>
                <p className="mt-1 font-medium text-white">
                  {origin?.name ?? 'Not selected'}
                </p>
              </div>

              <div>
                <p className="text-[#929bad]">Destination</p>
                <p className="mt-1 font-medium text-white">
                  {destination?.name ?? 'Not selected'}
                </p>
              </div>

              <div className="flex justify-between border-t border-[#252e3e] pt-3">
                <span className="text-[#929bad]">Departure</span>
                <span className="text-white">
                  {departureDate} {departureTime}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#929bad]">Intermediate stops</span>
                <span className="text-white">
                  {stops.filter((stop) => stop !== null).length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#929bad]">Available seats</span>
                <span className="text-white">{ride.availableSeats}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#929bad]">Price per seat</span>
                <span className="font-semibold text-[#36e0c0]">
                  ₹{pricePerSeat}
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-6 py-3.5 text-xs font-semibold text-white shadow-xl transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Ride...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/my-rides')}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-[#252e3e] px-6 py-3 text-xs font-semibold text-[#929bad] transition hover:bg-[#1b2230] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
