import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Bell,
  ChevronDown,
  UserRound,
  LogOut,
} from 'lucide-react';

const navigationItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Find a Ride', to: '/rides/search' },
  { label: 'Offer a Ride', to: '/rides/create' },
  { label: 'My Rides', to: '/my-rides' },
  { label: 'Recurring Rides', to: '/recurring-rides' },
];

interface NavbarProps {
  userName?: string;
  profilePhoto?: string;
  onLogout: () => Promise<void>;
}

export default function Navbar({
  userName = 'Traveller',
  profilePhoto,
  onLogout,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
    setIsProfileMenuOpen(false);
    await onLogout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#252e3e] bg-[#080b12]/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#929bad] transition hover:bg-[#161b27] hover:text-white xl:hidden"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 flex-1 items-center justify-start gap-1 xl:flex"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'border border-[#8b78ff]/30 bg-[#8b78ff]/15 font-medium text-[#b6a8ff]'
                    : 'text-[#929bad] hover:bg-[#161b27] hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex w-full items-center justify-end gap-2.5 xl:w-auto">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-[#252e3e] bg-[#111722] px-3.5 py-1.5 text-xs text-[#c7cddd] transition hover:border-[#8b78ff]/50 hover:text-white sm:inline-flex"
          >
            <Sparkles size={13} className="text-[#b6a8ff]" />
            <span>AI Copilot</span>
          </button>

          <button
            type="button"
            aria-label="Messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#252e3e] bg-[#111722] text-[#929bad] transition hover:border-[#30394b] hover:text-white"
          >
            <MessageSquare size={16} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#252e3e] bg-[#111722] text-[#929bad] transition hover:border-[#30394b] hover:text-white"
          >
            <Bell size={16} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#36e0c0]" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-[#252e3e] bg-[#111722] py-1 pl-1.5 pr-2.5 transition hover:border-[#8b78ff]/50"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b2030] text-[11px] font-semibold text-[#b6a8ff]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}

              <span className="hidden max-w-28 truncate text-xs font-medium text-white sm:block">
                {userName}
              </span>

              <ChevronDown
                size={13}
                className={`hidden text-[#929bad] transition-transform sm:block ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-[#252e3e] bg-[#111722] shadow-2xl"
              >
                {/* User information */}
                <div className="border-b border-[#252e3e] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {userName}
                  </p>
                  <p className="mt-1 text-[11px] text-[#929bad]">
                    Manage your Ridezo account
                  </p>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-[#c7cddd] transition hover:bg-[#1b2230] hover:text-white"
                >
                  <UserRound size={16} className="text-[#b6a8ff]" />
                  My Profile
                </button>

                {/* Logout */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 border-t border-[#252e3e] px-4 py-3 text-left text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
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
                    'rounded-xl px-3.5 py-2.5 text-xs transition-colors',
                    isActive
                      ? 'bg-[#8b78ff]/15 font-medium text-[#b6a8ff]'
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
