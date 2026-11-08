import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CarFront,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import type { Vehicle } from '../types/vehicle.types';
import { getMyVehicles, deactivateVehicle } from '../api/vehicle.api';
import VehicleCard from '../components/VehicleCard';

export default function VehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setVehicles(await getMyVehicles());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to load vehicles.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchVehicles = async () => {
      try {
        const data = await getMyVehicles();

        if (isActive) {
          setVehicles(data);
          setError(null);
        }
      } catch (error) {
        if (isActive) {
          setError(
            error instanceof Error ? error.message : 'Unable to load vehicles.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchVehicles();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleDeactivate(vehicle: Vehicle) {
    const confirmed = window.confirm(
      `Deactivate ${vehicle.brand} ${vehicle.model}?`,
    );

    if (!confirmed || deactivatingId) return;

    try {
      setDeactivatingId(vehicle.id);
      await deactivateVehicle(vehicle.id);
      setVehicles((current) =>
        current.filter((item) => item.id !== vehicle.id),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to deactivate vehicle.',
      );
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Fleet &amp; Vehicles
          </h1>
          <p className="mt-1 text-xs text-[#929bad]">
            Manage your registered vehicles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/vehicles/add')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={15} />
          Add Vehicle
        </button>
      </div>

      {/* Account Information */}
      <div className="flex items-start gap-3 rounded-lg border border-[#252e3e] bg-[#111722]/80 p-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8b78ff]/15 text-sm text-[#a99aff]">
          ⇄
        </span>
        <p className="text-xs leading-relaxed text-[#c7cddd]">
          Your account supports both driving and booking rides. Registering a
          vehicle lets you prepare to publish carpools.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#252e3e] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Your Vehicles</h2>
          <p className="mt-1 text-[11px] text-[#929bad]">
            {vehicles.length} registered vehicle
            {vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadVehicles()}
          disabled={isLoading}
          aria-label="Refresh vehicles"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#30394b] text-[#929bad] transition hover:bg-[#1b2230] hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2">
          <LoaderCircle size={26} className="animate-spin text-[#a99aff]" />
          <p className="text-xs text-[#929bad]">Loading vehicles...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-8 text-center">
          <AlertCircle size={26} className="text-red-400" />
          <h3 className="mt-3 text-sm font-semibold text-white">
            Unable to load vehicles
          </h3>
          <p className="mt-1 text-xs text-[#929bad]">{error}</p>
          <button
            type="button"
            onClick={() => void loadVehicles()}
            className="mt-4 rounded-lg bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && vehicles.length === 0 && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#30394b] bg-[#111722]/50 px-5 text-center">
          <CarFront size={34} className="text-[#a99aff]" />
          <h3 className="mt-3 text-sm font-semibold text-white">
            No vehicles added yet
          </h3>
          <p className="mt-1 text-xs text-[#929bad]">
            Add your first vehicle to get started.
          </p>
          <button
            type="button"
            onClick={() => navigate('/vehicles/add')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} />
            Add Vehicle
          </button>
        </div>
      )}

      {/* Vehicle Cards */}
      {!isLoading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="relative">
              <VehicleCard vehicle={vehicle} onDeactivate={handleDeactivate} />

              {deactivatingId === vehicle.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs">
                  <LoaderCircle size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Safety Information */}
      <div className="flex items-start gap-3 rounded-xl border border-[#252e3e] bg-[#111722] p-4">
        <span className="text-lg">🛡️</span>
        <div>
          <h3 className="text-xs font-semibold text-white">
            Vehicle Verification
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#929bad]">
            Submit the required vehicle documents for verification before
            offering rides.
          </p>
        </div>
      </div>
    </div>
  );
}
