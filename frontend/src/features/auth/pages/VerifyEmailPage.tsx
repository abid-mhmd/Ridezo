import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { resendEmailOtp, verifyEmailOtp } from '../api/auth.api';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = (location.state as { email?: string } | null)?.email;

  const [otpValues, setOtpValues] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  if (!email) {
    return null;
  }

  const handleInputChange = (index: number, value: string) => {
    setError('');
    setMessage('');

    // Handle single digit or pasted digits
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length > 1) {
      // Handle paste or multi-character entry
      const digits = cleanValue.split('').slice(0, 6);
      const newValues = [...otpValues];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newValues[index + i] = digit;
        }
      });

      setOtpValues(newValues);

      // Focus next empty or last box
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newValues = [...otpValues];
    newValues[index] = cleanValue;
    setOtpValues(newValues);

    // Auto-advance focus to next input if a digit was entered
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
        inputRefs.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pastedData) return;

    const newValues = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      newValues[idx] = char;
    });
    setOtpValues(newValues);

    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const otpString = otpValues.join('');

    if (otpString.length !== 6) {
      setError("The code doesn't match. Check your inbox and try again.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyEmailOtp({ email, otp: otpString });

      setMessage(response.message || 'Email verified successfully.');

      navigate('/login', {
        replace: true,
        state: { message: 'Your email has been verified. You can now log in.' },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please try again.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setError('');
    setMessage('');
    setIsResending(true);

    try {
      const response = await resendEmailOtp({ email });

      setOtpValues(['', '', '', '', '', '']);
      setMessage(
        response.message || 'A fresh verification code was sent to your email.',
      );
      setResendCooldown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not resend the code. Please try again.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ridezo-bg text-gray-100 font-sans">
      {/* Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6 sm:px-10">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ridezo-primary to-[#6c55ff] text-white shadow-lg shadow-ridezo-primary/25 transition group-hover:scale-105">
            <span className="text-base font-bold tracking-tighter">R</span>
          </div>

          <span className="text-base font-bold tracking-tight text-white">
            Ridezo
          </span>
        </a>

        <Link
          to="/register"
          className="text-xs font-medium text-gray-400 transition hover:text-white"
        >
          ← &nbsp; Back to registration
        </Link>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-ridezo-border bg-ridezo-surface p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-ridezo-primary/30 bg-ridezo-primary/10 text-xl text-ridezo-primary-light">
            ✉
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            Verify your email
          </h1>

          <p className="mt-1.5 text-xs leading-5 text-ridezo-muted">
            We sent a 6-digit verification code to
            <span className="mt-1 block break-all font-medium text-gray-200">
              {email}
            </span>
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300">
                Verification code
              </label>

              {/* 6 Individual OTP Boxes */}
              <div className="flex justify-between gap-2 sm:gap-3">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {inputRefs.current[index] = el}}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${index + 1}`}
                    className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl border bg-ridezo-bg text-center font-mono text-xl font-bold text-white outline-none transition focus:border-ridezo-primary focus:ring-1 focus:ring-ridezo-primary ${
                      error ? 'border-red-500' : 'border-ridezo-border'
                    }`}
                  />
                ))}
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

            {message && (
              <p
                role="status"
                className="rounded-lg border border-ridezo-success/30 bg-ridezo-success/10 px-3 py-2 text-xs leading-5 text-ridezo-success"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || isResending}
              className="w-full rounded-xl bg-ridezo-primary px-4 py-3 text-xs font-semibold text-[#080B12] transition hover:bg-ridezo-primary-light disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-ridezo-primary/20"
            >
              {isVerifying ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-ridezo-muted">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isVerifying || resendCooldown > 0}
                className="font-medium text-ridezo-primary-light transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'}
              </button>
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400">
            Already verified?{' '}
            <Link
              to="/login"
              className="font-medium text-ridezo-primary-light hover:text-white transition"
            >
              Log in
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5">
            <span className="text-ridezo-success text-[10px]">🛡️</span>

            <p className="text-center text-[11px] leading-relaxed text-gray-400">
              For your security, never share your verification code with anyone.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
