import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

import { addVehicle } from '../api/vehicle.api';
import VehicleForm from '../components/VehicleForm';

import type { VehicleFormValues } from '../schemas/vehicle.schema';

export default function AddVehiclePage() {
  const navigate = useNavigate();

  const handleSubmit = async (values: VehicleFormValues) => {
    await addVehicle({
      ...values,
      vehiclePhoto: values.vehiclePhoto || undefined,
    });

    navigate('/vehicles');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 font-sans text-gray-100">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/vehicles')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929bad] transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Your Vehicles
      </button>

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Add a Vehicle
        </h1>

        <p className="mt-1 text-xs text-[#929bad]">
          Register the vehicle you'll use when publishing carpools across Kerala
          highway corridors.
        </p>
      </div>

      {/* Verification Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-[#8b78ff]/20 bg-[#8b78ff]/[0.06] p-4">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#b6a8ff]" />

        <div className="text-xs leading-relaxed text-[#c7cddd]">
          <strong className="font-medium text-white">
            Important Verification Requirement:
          </strong>{' '}
          Adding a vehicle creates its profile in your garage, but does not
          automatically make it eligible for offering rides. Required vehicle
          documents (RC, Insurance, PUC) must be submitted and validated before
          seats can be published.
        </div>
      </div>

      {/* Reusable Form */}
      <VehicleForm
        submitLabel="Register Vehicle & Save"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
