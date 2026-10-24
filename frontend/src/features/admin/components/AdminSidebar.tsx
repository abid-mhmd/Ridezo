import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiUsers, FiLogOut, FiX } from 'react-icons/fi';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void | Promise<void>;
}

const navigationItems = [
  {
    label: 'Users',
    path: '/admin/users',
    icon: <FiUsers size={17} className="shrink-0" />,
  },
];

export default function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
  onLogout,
}: AdminSidebarProps) {
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Clean Fixed Sidebar */}
      <aside
        aria-label="Admin sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 flex w-54 flex-col
          border-r border-[#263044] bg-[#06080D]
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Branding header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#263044] px-5">
          <NavLink
            to="/admin/users"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#C37DF5] to-[#D56BCF] text-sm font-black text-white shadow-md">
              R
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                ridezo<span className="text-[#C37DF5]">.</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                Administration
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-[#111722] hover:text-[#F8FAFC] lg:hidden"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#707B8F]">
            Workspace
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border border-[#C37DF5]/20 bg-gradient-to-r from-[#C37DF5]/15 to-[#D56BCF]/5 text-[#C37DF5]'
                      : 'border border-transparent text-[#A7B0C0] hover:bg-[#111722] hover:text-[#F8FAFC]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#C37DF5]" />
                    )}
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C37DF5]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Administrator profile & Sign out */}
        <div className="shrink-0 border-t border-[#263044] p-3">
          <div className="mb-2.5 flex items-center gap-2.5 rounded-xl bg-[#111722] p-2.5 border border-[#263044]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C37DF5]/20 bg-[#C37DF5]/10 text-xs font-bold text-[#C37DF5]">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#F8FAFC]">
                Administrator
              </p>
              <p className="text-[10px] text-[#707B8F]">Admin account</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs font-medium text-[#A7B0C0] transition hover:border-red-500/10 hover:bg-red-500/10 hover:text-red-300"
          >
            <FiLogOut size={16} className="shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
