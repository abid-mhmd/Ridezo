import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import AuthInput from '../../../../components/AuthInput';
import { loginAdmin } from '../api/admin-auth.api';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, expiresIn: number) => void;
}

export default function AdminLoginPage({
  onLoginSuccess,
}: AdminLoginPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginAdmin({ email, password });

      if (result.user.role !== 'admin') {
        setError('You are not authorized to access the admin portal.');
        return;
      }

      onLoginSuccess(result.accessToken, result.expiresIn);
      navigate('/admin/users', { replace: true });
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ridezo-bg text-gray-100 font-sans">
      {/* Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6 sm:px-10">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ridezo-primary to-[#6c55ff] text-white shadow-lg shadow-ridezo-primary/25 transition group-hover:scale-105">
            <span className="text-base font-bold tracking-tighter">T</span>
          </div>

          <span className="text-base font-bold tracking-tight text-white">
            Tripzo{' '}
            <span className="text-xs font-normal text-ridezo-muted ml-1">
              Admin Portal
            </span>
          </span>
        </a>

        <Link
          to="/login"
          className="text-xs font-medium text-gray-400 transition hover:text-white"
        >
          ← &nbsp; User login
        </Link>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-ridezo-border bg-ridezo-surface p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ridezo-primary/20 bg-ridezo-primary/[0.08] px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-ridezo-primary shadow-[0_0_10px_#8b78ff]" />
            <span className="text-[11px] font-semibold tracking-wide text-ridezo-primary-light">
              Secure Administration
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            Welcome back
          </h1>

          <p className="mt-1.5 text-xs leading-5 text-ridezo-muted">
            Sign in to manage Tripzo operations securely.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <AuthInput
              id="admin-email"
              label="Email address"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div>
              <AuthInput
                id="admin-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-gray-400 hover:text-white transition focus:outline-none"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                }
              />

              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-[11px] font-medium text-ridezo-primary-light transition hover:text-white"
                  onClick={() => {
                    setError(
                      'Password reset is restricted to system administrators.',
                    );
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-ridezo-primary px-4 py-3 text-xs font-semibold text-[#080B12] transition hover:bg-ridezo-primary-light disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-ridezo-primary/20"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-ridezo-border" />
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider">
              OR
            </span>
            <div className="h-px flex-1 bg-ridezo-border" />
          </div>

          <p className="text-center text-xs text-gray-400">
            Not an administrator?{' '}
            <Link
              to="/login"
              className="font-medium text-ridezo-primary-light hover:text-white transition"
            >
              User login
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5">
            <span className="text-ridezo-success text-[10px]">🛡️</span>
            <p className="text-center text-[11px] leading-relaxed text-gray-400">
              Authorized Tripzo administrators only.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 text-xs text-gray-400 sm:flex-row sm:items-center">
          <p>© 2026 Tripzo Mobility Technologies. All rights reserved.</p>

          <nav className="flex flex-wrap gap-6 text-[11px]">
            <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-white">
              Terms &amp; Conditions
            </a>
            <a href="/security" className="transition hover:text-white">
              Security Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
