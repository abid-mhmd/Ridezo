import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
          {title}
        </h1>

        <p className="mt-1 text-xs text-[#A7B0C0]">{description}</p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
