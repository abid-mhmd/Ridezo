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
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  profilePhoto?: string;
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
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-[#252e3e] px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b78ff] text-sm font-bold text-white">
            R
          </span>

          <span className="text-sm font-semibold tracking-tight text-white">
            Ridezo
          </span>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Sidebar navigation"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {navigationGroups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#657086]">
                {group.title}
              </h2>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-2.5 py-2.5',
                          'text-xs transition-colors',
                          isActive
                            ? 'bg-[#8b78ff]/15 font-medium text-[#b6a8ff]'
                            : 'text-[#929bad] hover:bg-[#161b27] hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icon size={15} className="shrink-0" />

                      <span className="min-w-0 flex-1">{item.label}</span>

                      {item.label === 'Messages' && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#252e3e] px-1 text-[9px] text-[#c7cddd]">
                          0
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {/* Account shortcut */}
        <div className="shrink-0 border-t border-[#252e3e] p-3">
          <NavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-lg border border-[#252e3e] bg-[#111722] p-2 transition hover:border-[#8b78ff]/40"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#252e3e] text-xs font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-white">
                {userName}
              </span>
              <span className="block text-[10px] text-[#36e0c0]">
                Ridezo Traveller
              </span>
            </span>

            <ChevronRight size={15} className="shrink-0 text-[#657086]" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
