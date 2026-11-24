import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { searchRides } from '../api/ride.api';
import type { Ride, SearchRidesResult } from '../types/ride.types';
import RideSearchForm from '../components/RideSearchForm';
import type { RideSearchFormValues } from '../components/RideSearchForm';
import RideCard from '../components/Ride-card';
import RideFilters, { type RideFilterState } from '../components/RideFilters';
import Pagination from '../../../components/layout/Pagination';
import LoadingState from '../../../components/LoadingState';

interface SearchLocationState {
  search?: RideSearchFormValues;
}

type RideSortOption = 'departure' | 'price-low' | 'price-high';

function createDefaultFilters(seats: number): RideFilterState {
  return {
    departureWindows: [],
    maxPrice: undefined,
    seats,
    verifiedDriverOnly: false,
    topRatedOnly: false,
    acCabinOnly: false,
    maxTwoBackseatOnly: false,
    languages: [],
  };
}

export default function RideSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSearch = (location.state as SearchLocationState | null)?.search;

  const [searchValues, setSearchValues] = useState<RideSearchFormValues | null>(
    initialSearch ?? null,
  );

  const [rides, setRides] = useState<Ride[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<RideFilterState>(() =>
    createDefaultFilters(initialSearch?.seats ?? 1),
  );
  const [sortBy, setSortBy] = useState<RideSortOption>('departure');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = (values: RideSearchFormValues) => {
    setSearchValues(values);
    setFilters((prev) => ({ ...prev, seats: values.seats }));
    setCurrentPage(1);
  };

  const handleFilterChange = (next: RideFilterState) => {
    const serverFilterChanged =
      next.seats !== filters.seats ||
      next.maxPrice !== filters.maxPrice ||
      next.departureWindows.join(',') !== filters.departureWindows.join(',');

    if (searchValues && next.seats !== searchValues.seats) {
      setSearchValues({ ...searchValues, seats: next.seats });
    }

    setFilters(next);

    if (serverFilterChanged) {
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    const resetSeats = 1;
    if (searchValues && searchValues.seats !== resetSeats) {
      setSearchValues({ ...searchValues, seats: resetSeats });
    }
    setFilters(createDefaultFilters(resetSeats));
    setCurrentPage(1);
  };

  const handleSortChange = (nextSort: RideSortOption) => {
    setSortBy(nextSort);
    setCurrentPage(1);
  };

  const departureWindowsKey = filters.departureWindows.join(',');

  const selectedDepartureWindows = useMemo(
    () =>
      departureWindowsKey
        ? (departureWindowsKey.split(
            ',',
          ) as RideFilterState['departureWindows'])
        : undefined,
    [departureWindowsKey],
  );

  useEffect(() => {
    if (!searchValues) return;

    let isActive = true;

    const fetchRides = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [originLongitude, originLatitude] =
          searchValues.origin.coordinates.coordinates;

        const [destinationLongitude, destinationLatitude] =
          searchValues.destination.coordinates.coordinates;

        const result: SearchRidesResult = await searchRides({
          originLongitude,
          originLatitude,
          destinationLongitude,
          destinationLatitude,
          departureDate: searchValues.departureDate,
          seats: filters.seats,
          maxPrice: filters.maxPrice,
          departureWindows: selectedDepartureWindows,
          sortBy,
          page: currentPage,
          limit: 10,
        });

        if (!isActive) return;

        setRides(result.rides);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch {
        if (isActive) {
          setRides([]);
          setTotal(0);
          setTotalPages(1);
          setError('Unable to load rides. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchRides();

    return () => {
      isActive = false;
    };
  }, [
    searchValues,
    filters.seats,
    filters.maxPrice,
    selectedDepartureWindows,
    sortBy,
    currentPage,
  ]);

  const hasClientFilters = Boolean(
    filters.verifiedDriverOnly ||
    filters.topRatedOnly ||
    filters.acCabinOnly ||
    filters.maxTwoBackseatOnly ||
    filters.languages.length > 0,
  );

  const visibleRides = useMemo(() => {
    return rides.filter((ride) => {
      if (
        filters.verifiedDriverOnly &&
        !['verified', 'approved'].includes(
          ride.driver?.identityVerificationStatus?.toLowerCase() ?? '',
        )
      ) {
        return false;
      }

      if (filters.topRatedOnly && (ride.driver?.rating ?? 0) < 4.8) {
        return false;
      }

      if (
        filters.acCabinOnly &&
        !ride.preferences?.climateControl?.toLowerCase().includes('ac')
      ) {
        return false;
      }

      if (
        filters.maxTwoBackseatOnly &&
        !ride.preferences?.seatingComfort?.toLowerCase().includes('two') &&
        !ride.preferences?.seatingComfort?.includes('2')
      ) {
        return false;
      }

      if (filters.languages.length > 0) {
        const driverLangs = (ride.driver?.languages ?? []).map((l) =>
          l.toLowerCase(),
        );
        const hasMatch = filters.languages.some((l) =>
          driverLangs.includes(l.toLowerCase()),
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [rides, filters]);

  if (!searchValues) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-gray-100">
        <MapPin size={28} className="mx-auto text-[#36e0c0]" />

        <h2 className="mt-3 text-lg font-semibold text-white">
          Search for a ride first
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          Enter your journey details to find available rides.
        </p>

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mt-4 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 py-2 text-xs font-semibold text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const displayedCount = hasClientFilters ? visibleRides.length : total;

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8 font-sans text-gray-100">
      {/* Page Heading */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>

        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Find your next ride
        </h1>

        <p className="mt-1 text-xs text-[#929bad]">
          Explore available journeys and choose the one that suits you.
        </p>
      </div>

      {/* Editable Search Form */}
      <section className="relative rounded-2xl border border-[#252e3e] bg-[#111722] p-4 shadow-xl sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8b78ff] via-[#b6a8ff] to-[#36e0c0]" />

        <div className="mb-3">
          <h2 className="text-sm font-semibold text-white">Your journey</h2>

          <p className="mt-0.5 text-[11px] text-[#929bad]">
            Change your locations or travel details to search again.
          </p>
        </div>

        <RideSearchForm
          initialValues={searchValues}
          onSearch={handleSearch}
          isSearching={isLoading}
        />
      </section>

      {/* Results Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Filters Sidebar */}
        <aside className="w-full lg:sticky lg:top-5 lg:self-start">
          <RideFilters
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Ride Results */}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold text-white">
                {isLoading
                  ? 'Searching rides...'
                  : `${displayedCount} ${displayedCount === 1 ? 'ride' : 'rides'} found`}
              </h2>

              <p className="mt-0.5 text-[11px] text-[#929bad]">
                {searchValues.origin.name} → {searchValues.destination.name}
              </p>
            </div>

            {!isLoading && !error && visibleRides.length > 0 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="rideSort"
                  className="text-[11px] text-[#929bad]"
                >
                  Sort by
                </label>

                <select
                  id="rideSort"
                  value={sortBy}
                  onChange={(event) =>
                    handleSortChange(event.target.value as RideSortOption)
                  }
                  className="rounded-lg border border-[#252e3e] bg-[#111722] px-3 py-2 text-xs text-white outline-none focus:border-[#8b78ff]"
                >
                  <option value="departure">Departure time</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            )}
          </div>

          {isLoading && <LoadingState message="Searching available rides..." />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-xs text-red-300">
              {error}
            </div>
          )}

          {!isLoading && !error && visibleRides.length === 0 && (
            <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-10 text-center">
              <MapPin size={32} className="mx-auto text-[#929bad]" />

              <h3 className="mt-3 text-sm font-semibold text-white">
                No rides found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs text-[#929bad]">
                We couldn&apos;t find any rides matching your current filters.
                Try clearing filters or changing your travel date.
              </p>
            </div>
          )}

          {!isLoading && !error && visibleRides.length > 0 && (
            <div className="space-y-3">
              {visibleRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onViewDetails={(rideId) => navigate(`/rides/${rideId}`)}
                />
              ))}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
