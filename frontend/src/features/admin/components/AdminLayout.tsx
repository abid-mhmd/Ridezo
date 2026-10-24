import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FiMenu } from 'react-icons/fi';

interface AdminLayoutProps {
  onLogout: () => void | Promise<void>;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] font-sans">
      <div className="flex min-h-screen">
        {/* Reusable Clean Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={onLogout}
        />

        {/* Main dashboard area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Shared Header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#263044] bg-[#06080D]/90 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263044] text-[#A7B0C0] transition hover:bg-[#111722] hover:text-[#F8FAFC] lg:hidden"
                aria-label="Open navigation menu"
              >
                <FiMenu size={18} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-wider text-[#707B8F]">
                  Tripzo <span className="px-1">/</span> Administration
                </p>
                <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                  Admin Operations Portal
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-[11px] font-medium text-[#34D399] sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                Admin Portal
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#C37DF5]/20 bg-[#C37DF5]/10 text-xs font-bold text-[#C37DF5]">
                A
              </div>
            </div>
          </header>

          {/* Current admin nested page content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
