import type { ReactNode } from 'react';

interface AdminSummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconClassName: string;
}

export default function AdminSummaryCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: AdminSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#263044] bg-[#111722] p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#A7B0C0]">{title}</p>

          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">{value}</p>

          <p className="mt-1 text-[11px] text-[#707B8F]">{description}</p>
        </div>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
