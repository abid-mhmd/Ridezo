import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

interface AppLayoutProps {
  onLogout: () => Promise<void>;
}

export default function AppLayout({ onLogout }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar onLogout={onLogout} />

      {/* Main content wrapper shifted right on large screens to accommodate the fixed sidebar */}
      <div className="flex flex-1 flex-col min-h-screen lg:pl-60">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
