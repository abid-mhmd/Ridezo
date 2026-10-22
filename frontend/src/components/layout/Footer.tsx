import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#252e3e] bg-[#080b12] px-6 py-6 sm:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-xs text-[#929bad] sm:flex-row">
        <p>© {new Date().getFullYear()} Tripzo. Travel together.</p>

        <div className="flex flex-wrap items-center justify-center gap-6">
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
