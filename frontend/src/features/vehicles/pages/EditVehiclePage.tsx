import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { getVehicleById, updateVehicle } from '../api/vehicle.api';
import VehicleForm from '../components/VehicleForm';

import type { VehicleFormValues } from '../schemas/vehicle.schema';
import type { VehicleFormSubmitValues } from '../components/VehicleForm';
export default function EditVehiclePage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<VehicleFormValues | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError('Invalid vehicle ID.');
        setIsLoading(false);
        return;
      }

      try {
        const vehicle = await getVehicleById(vehicleId);

        setInitialValues({
          vehicleType: vehicle.vehicleType,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          registrationNumber: vehicle.registrationNumber,
          seatCapacity: vehicle.seatCapacity,
          fuelType: vehicle.fuelType,
          vehiclePhoto: vehicle.vehiclePhoto,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load vehicle details.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async (values: VehicleFormSubmitValues) => {
    if (!vehicleId) return;

    await updateVehicle(vehicleId, values);

    navigate('/vehicles');
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-[#929bad]">
        Loading vehicle details...
      </div>
    );
  }

  if (error || !initialValues) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-red-400">{error || 'Vehicle not found.'}</p>

        <button
          onClick={() => navigate('/vehicles')}
          className="text-xs text-[#b6a8ff] hover:text-white"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 font-sans text-gray-100">
      <button
        type="button"
        onClick={() => navigate('/vehicles')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Your Vehicles
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit Vehicle
        </h1>

        <p className="mt-1 text-xs text-[#929bad]">
          Update your vehicle information.
        </p>
      </div>

      <VehicleForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
