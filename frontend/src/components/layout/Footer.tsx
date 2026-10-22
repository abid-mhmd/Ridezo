import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#252e3e] bg-[#080b12] px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-[#929bad] sm:flex-row">
        <p>© {new Date().getFullYear()} Ridezo. Travel together.</p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/support" className="transition hover:text-white">
            Help & Support
          </Link>

          <Link to="/privacy" className="transition hover:text-white">
            Privacy
          </Link>

          <Link to="/terms" className="transition hover:text-white">
            Terms
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#36e0c0]" />
          <span>Travel safely</span>
          <Heart size={12} className="text-[#8b78ff]" />
        </div>
      </div>
    </footer>
  );
}
