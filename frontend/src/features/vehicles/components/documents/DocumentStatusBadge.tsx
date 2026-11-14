import type { DocumentVerificationStatus } from '../../types/vehicle-document.types';

interface DocumentStatusBadgeProps {
  status: DocumentVerificationStatus;
}

const STATUS_STYLES: Record<
  DocumentVerificationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'border-amber-400/20 bg-amber-400/10 text-amber-400',
  },
  approved: {
    label: 'Verified',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'border-red-400/20 bg-red-400/10 text-red-400',
  },
  requires_review: {
    label: 'Under Review',
    className: 'border-purple-400/20 bg-purple-400/10 text-purple-400',
  },
};

export default function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  const config = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
