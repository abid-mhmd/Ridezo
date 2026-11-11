import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

interface AppLayoutProps {
  onLogout: () => Promise<void>;
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#080b12] text-white">
      {/* Sidebar navigation */}
      <Sidebar onLogout={onLogout} />

      {/* Main content wrapper shifted right on large screens */}
      <div className="flex min-h-dvh flex-col lg:pl-60">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}