import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';

import type { RideLocation } from '../types/ride.types';

interface PhotonProperties {
  osm_type: string;
  osm_id: number;
  name?: string;
  street?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
  type?: string;
}

interface PhotonFeature {
  type: 'Feature';
  properties: PhotonProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

interface LocationPickerProps {
  label: string;
  placeholder?: string;
  value?: RideLocation | null;
  onSelect: (location: RideLocation | null) => void;
}

const PHOTON_API = 'https://photon.komoot.io/api/';

function mapPhotonLocation(feature: PhotonFeature): RideLocation {
  const properties = feature.properties;
  const name = properties.name ?? 'Unknown location';

  const addressParts = [
    properties.street,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.country,
    properties.postcode,
  ].filter((value): value is string => Boolean(value));

  const address = [...new Set(addressParts)].join(', ');

  return {
    placeId: `${properties.osm_type}:${properties.osm_id}`,
    name,
    address,
    coordinates: {
      type: 'Point',
      coordinates: feature.geometry.coordinates,
    },
  };
}

export default function LocationPicker({
  label,
  placeholder = 'Search for a location...',
  value = null,
  onSelect,
}: LocationPickerProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  useEffect(() => {
    if (value) {
      setSearch(value.address ? `${value.name}, ${value.address}` : value.name);
      setIsLocationSelected(true);
    } else {
      setSearch('');
      setIsLocationSelected(false);
    }
  }, [value]);

  useEffect(() => {
    if (isLocationSelected) {
      return;
    }

    const query = search.trim();

    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');

        const params = new URLSearchParams({
          q: query,
          limit: '6',
          lang: 'en',
          countrycode: 'IN',
        });

        const response = await fetch(`${PHOTON_API}?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to search locations.');
        }

        const data: PhotonResponse = await response.json();

        setSuggestions(data.features);
        setIsOpen(true);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        setSuggestions([]);
        setError('Location search failed. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, isLocationSelected]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsLocationSelected(false);
    setSearch(event.target.value);
    setIsOpen(true);
    onSelect(null);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const location = mapPhotonLocation(feature);

    setIsLocationSelected(true);

    setSearch(
      location.address
        ? `${location.name}, ${location.address}`
        : location.name,
    );

    setSuggestions([]);
    setIsOpen(false);
    setError('');

    onSelect(location);
  };

  const handleClear = () => {
    setSearch('');
    setIsLocationSelected(false);
    setSuggestions([]);
    setIsOpen(false);
    setError('');

    onSelect(null);
  };

  return (
    <div className="relative space-y-1">
      <label className="block text-[11px] font-medium text-[#c7cddd]">
        {label}
      </label>

      <div className="relative">
        <MapPin
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929bad]"
        />

        <input
          type="text"
          value={search}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-[#252e3e] bg-[#080b12] py-2.5 pl-9 pr-9 text-xs text-white outline-none placeholder:text-gray-600 focus:border-[#8b78ff]"
        />

        {isLoading ? (
          <Loader2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8b78ff]"
          />
        ) : search ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929bad] hover:text-white"
            aria-label="Clear location"
          >
            <X size={15} />
          </button>
        ) : (
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657086]"
          />
        )}
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#252e3e] bg-[#111722] shadow-2xl">
          {suggestions.map((feature) => {
            const location = mapPhotonLocation(feature);

            return (
              <button
                key={location.placeId}
                type="button"
                onClick={() => handleSelect(feature)}
                className="flex w-full items-start gap-2.5 border-b border-[#252e3e] px-3.5 py-2.5 text-left transition last:border-0 hover:bg-[#1b2230]"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#8b78ff]" />

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {location.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-[#929bad]">
                    {location.address || 'Address unavailable'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen &&
        search.trim().length >= 3 &&
        !isLoading &&
        !error &&
        suggestions.length === 0 && (
          <p className="mt-1 text-[11px] text-[#929bad]">No locations found.</p>
        )}
    </div>
  );
}
