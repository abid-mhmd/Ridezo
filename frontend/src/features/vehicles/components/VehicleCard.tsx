import { useNavigate } from 'react-router-dom';
import {
  CarFront,
  Fuel,
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';

import type { Vehicle } from '../types/vehicle.types';
import VehicleStatusBadge from './VehicleStatusBadge';

interface VehicleCardProps {
  vehicle: Vehicle;
  onDeactivate: (vehicle: Vehicle) => void;
}

export default function VehicleCard({
  vehicle,
  onDeactivate,
}: VehicleCardProps) {
  const navigate = useNavigate();

  return (
    <article className="overflow-hidden rounded-2xl border border-[#252e3e] bg-[#111722] transition hover:border-[#8b78ff]/40 shadow-xl">
      {/* Vehicle image container */}
      <div className="relative h-48 bg-[#1b2230]">
        {vehicle.vehiclePhoto ? (
          <img
            src={vehicle.vehiclePhoto}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#657086]">
            <CarFront size={56} strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute right-3 top-3">
          <VehicleStatusBadge status={vehicle.verificationStatus} />
        </div>

        <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/70 px-3 py-1 font-mono text-xs font-semibold text-white backdrop-blur">
          {vehicle.registrationNumber}
        </div>
      </div>

      {/* Vehicle details */}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              {vehicle.brand} {vehicle.model}
            </h3>

            <p className="mt-0.5 text-xs capitalize text-[#929bad]">
              {vehicle.vehicleType} · {vehicle.color}
            </p>
          </div>

          <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-400/20">
            {vehicle.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-[#252e3e] py-3.5">
          <div className="flex flex-col items-center gap-1">
            <Fuel size={16} className="text-[#a99aff]" />
            <span className="text-[11px] capitalize text-[#c7cddd]">
              {vehicle.fuelType}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Users size={16} className="text-[#a99aff]" />
            <span className="text-[11px] text-[#c7cddd]">
              {vehicle.seatCapacity} Seats
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <CalendarDays size={16} className="text-[#a99aff]" />
            <span className="text-[11px] text-[#c7cddd]">{vehicle.year}</span>
          </div>
        </div>

        {/* Actions with Violet/Pink gradient styling matching reference */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/vehicles/${vehicle.id}/documents`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#30394b] px-3 py-2.5 text-xs font-semibold text-[#c7cddd] transition hover:border-[#8b78ff] hover:bg-[#8b78ff]/10"
          >
            <FileText size={14} />
            Documents
          </button>

          <button
            type="button"
            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
            disabled={!vehicle.isActive}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-3 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={14} />
            Manage Vehicle
          </button>

          <button
            type="button"
            onClick={() => onDeactivate(vehicle)}
            disabled={!vehicle.isActive}
            aria-label="Deactivate vehicle"
            title="Deactivate vehicle"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#30394b] text-[#929bad] transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
