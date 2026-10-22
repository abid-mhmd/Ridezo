import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Bell,
  ChevronDown,
} from 'lucide-react';

const navigationItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Find a Ride', to: '/rides/search' },
  { label: 'Offer a Ride', to: '/rides/offer' },
  { label: 'My Rides', to: '/my-rides' },
  { label: 'Recurring Rides', to: '/recurring-rides' },
];

interface NavbarProps {
  userName?: string;
  profilePhoto?: string;
}

export default function Navbar({
  userName = 'Traveller',
  profilePhoto,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#252e3e] bg-[#080b12]/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#929bad] transition hover:bg-[#161b27] hover:text-white lg:hidden"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand */}
        <NavLink
          to="/dashboard"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Ridezo home"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b78ff] text-sm font-bold text-white">
            R
          </span>

          <span className="text-base font-semibold tracking-tight text-white">
            Ridezo
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-full px-3 py-2 text-xs transition-colors',
                  isActive
                    ? 'border border-[#8b78ff]/40 bg-[#8b78ff]/10 text-[#b6a8ff]'
                    : 'text-[#929bad] hover:bg-[#161b27] hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions and account */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-[#30394b] bg-[#111722] px-3 py-2 text-xs text-[#c7cddd] transition hover:border-[#8b78ff]/50 hover:text-white sm:inline-flex"
          >
            <Sparkles size={14} className="text-[#b6a8ff]" />
            <span>AI Copilot</span>
          </button>

          <button
            type="button"
            aria-label="Messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#929bad] transition hover:bg-[#161b27] hover:text-white"
          >
            <MessageSquare size={17} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#929bad] transition hover:bg-[#161b27] hover:text-white"
          >
            <Bell size={17} />
            <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#36e0c0]" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[#252e3e] bg-[#111722] py-1 pl-2 pr-1.5 transition hover:border-[#8b78ff]/50"
            aria-label="Account menu"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#252e3e] text-xs font-semibold text-[#c7cddd]">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}

            <span className="hidden max-w-24 truncate text-xs text-white sm:block">
              {userName}
            </span>

            <ChevronDown size={14} className="hidden text-[#929bad] sm:block" />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#252e3e] bg-[#080b12] px-4 py-3 xl:hidden"
        >
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-[#8b78ff]/10 text-[#b6a8ff]'
                      : 'text-[#929bad] hover:bg-[#161b27] hover:text-white',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
