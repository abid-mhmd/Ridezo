import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#252e3e] bg-[#111722] p-8 text-center">
      {icon && (
        <div className="mb-4 flex justify-center text-gray-500">{icon}</div>
      )}

      <h3 className="font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm text-gray-400">{description}</p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
