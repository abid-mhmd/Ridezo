import type { VehicleVerificationStatus } from '../types/vehicle.types';

interface VehicleStatusBadgeProps {
  status?: VehicleVerificationStatus | 'verified' | string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending Verification',
    className: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-400/10 text-red-400 border-red-400/20',
  },
};

const DEFAULT_STYLE = {
  label: 'Unknown',
  className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function VehicleStatusBadge({
  status,
}: VehicleStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() ?? '';
  const config = statusStyles[normalizedStatus] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
