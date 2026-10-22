import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  CirclePlus,
  Map,
  RefreshCw,
  MessageSquare,
  Bell,
  Sparkles,
  CarFront,
  Bookmark,
  Radio,
  UserRound,
  Settings,
  CircleHelp,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LoaderCircle,
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  profilePhoto?: string;
  onLogout: () => Promise<void>;
}

const navigationGroups = [
  {
    title: 'Navigation',
    items: [
      { label: 'Home', to: '/dashboard', icon: Home },
      { label: 'Find a Ride', to: '/rides/search', icon: Search },
      { label: 'Offer a Ride', to: '/rides/offer', icon: CirclePlus },
      { label: 'My Rides', to: '/my-rides', icon: Map },
      { label: 'Recurring Rides', to: '/recurring-rides', icon: RefreshCw },
      { label: 'Messages', to: '/messages', icon: MessageSquare },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'AI Assistant', to: '/assistant', icon: Sparkles },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Vehicles', to: '/vehicles', icon: CarFront },
      { label: 'Saved Rides', to: '/saved-rides', icon: Bookmark },
      { label: 'Ride Alerts', to: '/ride-alerts', icon: Radio },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', to: '/profile', icon: UserRound },
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Help & Support', to: '/support', icon: CircleHelp },
    ],
  },
];

export default function Sidebar({
  userName = 'Traveller',
  profilePhoto,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
        className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#30394b] bg-[#111722] text-white shadow-lg lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col',
          'border-r border-[#252e3e] bg-[#080b12]',
          'transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-[#252e3e] px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b78ff] to-[#6c55ff] text-sm font-bold text-white shadow-md shadow-[#8b78ff]/25">
            T
          </span>

          <span className="text-base font-bold tracking-tight text-white">
            Tripzo
          </span>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Sidebar navigation"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-none"
        >
          {navigationGroups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#657086]">
                {group.title}
              </h2>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs transition-colors',
                          isActive
                            ? 'bg-[#8b78ff]/15 font-medium text-[#b6a8ff]'
                            : 'text-[#929bad] hover:bg-[#161b27] hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icon size={16} className="shrink-0" />

                      <span className="min-w-0 flex-1">{item.label}</span>

                      {item.label === 'Messages' && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#252e3e] px-1 text-[9px] font-medium text-[#c7cddd]">
                          2
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {/* Account shortcut and Logout */}
        <div className="shrink-0 space-y-2 border-t border-[#252e3e] p-3">
          <NavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl border border-[#252e3e] bg-[#111722] p-2.5 transition hover:border-[#8b78ff]/40"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b2030] text-xs font-semibold text-[#b6a8ff]">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-white">
                {userName}
              </span>

              <span className="block text-[10px] text-[#36e0c0]">
                Verified Traveller
              </span>
            </span>

            <ChevronRight size={14} className="shrink-0 text-[#657086]" />
          </NavLink>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs text-[#929bad] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <LoaderCircle size={15} className="shrink-0 animate-spin" />
            ) : (
              <LogOut size={15} className="shrink-0" />
            )}

            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
