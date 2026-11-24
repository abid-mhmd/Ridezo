import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import type { AuthUser } from '../features/auth/types/auth.types';

interface AppLayoutProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
  showSidebar?: boolean;
}

export default function AppLayout({
  user,
  onLogout,
  showSidebar = true,
}: AppLayoutProps) {
  const userName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="min-h-dvh bg-[#080b12] text-white">
      {showSidebar && <Sidebar userName={userName} onLogout={onLogout} />}

      <div
        className={`flex min-h-dvh flex-col ${showSidebar ? 'lg:pl-60' : ''}`}
      >
        <Navbar userName={userName} onLogout={onLogout} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </main>

        <Footer />
      </div>
    </div>
  );
}
