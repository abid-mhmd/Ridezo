import type { ReactNode } from 'react';

interface AdminTableContainerProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AdminTableContainer({
  title,
  description,
  actions,
  children,
  footer,
}: AdminTableContainerProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#263044] bg-[#111722] shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#263044] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">{title}</h2>

          <p className="mt-0.5 text-xs text-[#A7B0C0]">{description}</p>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </div>

      {/* Table content */}
      <div className="w-full overflow-hidden [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-3 sm:[&_td]:px-3.5 sm:[&_th]:px-3.5 lg:[&_td]:px-4 lg:[&_th]:px-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-[#263044] px-4 py-3 sm:px-5">
          {footer}
        </div>
      )}
    </div>
  );
}
