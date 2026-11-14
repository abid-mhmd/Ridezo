import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

interface AppLayoutProps {
  onLogout: () => Promise<void>;
  showSidebar?: boolean;
}

export default function AppLayout({
  onLogout,
  showSidebar = true,
}: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#080b12] text-white">
      {showSidebar && <Sidebar onLogout={onLogout} />}

      <div
        className={`flex min-h-dvh flex-col ${showSidebar ? 'lg:pl-60' : ''}`}
      >
        <Navbar onLogout={onLogout} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
