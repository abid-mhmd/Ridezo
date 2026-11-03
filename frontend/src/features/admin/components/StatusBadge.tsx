interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (value: string): string => {
    switch (value.toLowerCase()) {
      case 'active':
        return 'border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]';

      case 'suspended':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';

      case 'deactivated':
        return 'border-red-500/20 bg-red-500/10 text-red-300';

      default:
        return 'border-gray-500/20 bg-gray-500/10 text-gray-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${getStatusStyles(status)}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
