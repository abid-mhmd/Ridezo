import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import AuthInput from '../../../components/AuthInput';
import { loginUser } from '../api/auth.api';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
import type { AuthUser } from '../types/auth.types';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError('');

    try {
      const result = await loginUser({
        email: values.email,
        password: values.password,
      });

      onLoginSuccess(result.accessToken, result.user);
      navigate('/profile', { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      );
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
            Ridezo
          </span>
        </a>

        <a
          href="/"
          className="text-xs font-medium text-gray-400 transition hover:text-white"
        >
          ← &nbsp; Back to home
        </a>
      </header>

      {/* Main content */}
      <main className="mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        {/* Left promotional section */}
        <section className="mx-auto w-full max-w-[560px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ridezo-success/20 bg-ridezo-success/[0.08] px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-ridezo-success shadow-[0_0_10px_#36E0C0]" />

            <span className="text-[11px] font-semibold tracking-wide text-ridezo-success">
              Verified Peer-to-Peer Community
            </span>
          </div>

          <h1 className="max-w-[480px] text-3xl font-bold leading-[1.2] tracking-tight sm:text-5xl text-white">
            Every empty seat
            <br />
            is an easier{' '}
            <span className="bg-[linear-gradient(90deg,#818CF8_0%,#38BDF8_50%,#2DD4BF_100%)] bg-clip-text text-transparent">
              journey.
            </span>
          </h1>

          <p className="mt-4 max-w-[450px] text-sm leading-relaxed text-ridezo-muted">
            Log in to search routes, offer shared rides, and connect safely with
            verified passengers and drivers heading your way.
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl border border-ridezo-border bg-ridezo-surface shadow-2xl">
            <div className="relative aspect-[1.5/1] overflow-hidden">
              <img
                src="/images/login-image.jfif"
                alt="Passengers enjoying a shared car journey"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#080B12]/90 via-[#080B12]/20 to-transparent" />

              <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-[#111722]/90 p-4 backdrop-blur-md sm:inset-x-4 sm:bottom-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white flex items-center gap-1.5">
                      Kasaragod{' '}
                      <span className="text-ridezo-primary-light font-bold">
                        →
                      </span>{' '}
                      Kochi
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Tomorrow · 8:00 AM · 2 seats left
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-white">
                      ₹350{' '}
                      <span className="text-[10px] font-normal text-gray-400">
                        / seat
                      </span>
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-ridezo-success flex items-center justify-end gap-1">
                      <span>★</span> 4.9 · Verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="mx-auto w-full max-w-[420px]">
          <div className="rounded-2xl border border-ridezo-border bg-ridezo-surface p-6 shadow-2xl shadow-black/40 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Welcome back
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-ridezo-muted">
              Sign in to continue your journey with ridezo.
            </p>

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
            >
              <AuthInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <AuthInput
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
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
                  {...register('password')}
                />

                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-ridezo-primary-light transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-ridezo-primary px-4 py-3 text-xs font-semibold text-[#080B12] transition hover:bg-ridezo-primary-light disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-ridezo-primary/20"
              >
                {isSubmitting ? 'Signing in...' : 'Log in'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-ridezo-border" />
              <span className="text-[10px] font-semibold text-gray-500 tracking-wider">
                OR
              </span>
              <div className="h-px flex-1 bg-ridezo-border" />
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.assign(
                  `${import.meta.env.VITE_API_URL}/auth/google`,
                );
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-ridezo-border bg-white/[0.02] px-4 py-3 text-xs font-medium text-gray-300 transition hover:bg-white/[0.04]"
            >
              <FcGoogle className="h-4 w-4" />
              Continue with Google
            </button>

            <p className="mt-5 text-center text-xs text-gray-400">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-medium text-ridezo-primary-light hover:text-white transition"
              >
                Create an account
              </a>
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5">
              <span className="text-ridezo-success text-[10px]">🛡️</span>

              <p className="text-center text-[11px] leading-relaxed text-gray-400">
                Your account keeps every Ridezo journey connected, verified, and
                secure.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 text-xs text-gray-400 sm:flex-row sm:items-center">
          <p>© 2026 Ridezo Mobility Technologies. All rights reserved.</p>

          <nav className="flex flex-wrap gap-6 text-[11px]">
            <a href="/safety" className="transition hover:text-white">
              Safety Standards
            </a>

            <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>

            <a href="/terms" className="transition hover:text-white">
              Terms of Service
            </a>

            <a href="/contact" className="transition hover:text-white">
              Contact Support
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
