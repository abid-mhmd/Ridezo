import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <Sidebar />

      <div className="min-h-screen lg:pl-60">
        <Navbar />

        <main className="min-h-[calc(100vh-8rem)] p-4 sm:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
