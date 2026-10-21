import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import AuthInput from '../../../components/AuthInput';
import { resetPassword } from '../api/auth.api';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/auth.schema';

interface ResetPasswordLocationState {
  resetToken?: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = (location.state as ResetPasswordLocationState | null)
    ?.resetToken;

  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  if (!resetToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ridezo-bg px-4 text-gray-100">
        <section className="w-full max-w-md rounded-2xl border border-ridezo-border bg-ridezo-surface p-8">
          <h1 className="text-xl font-semibold">Reset session expired</h1>

          <p className="mt-3 text-sm leading-6 text-ridezo-muted">
            Please verify your password-reset code again before creating a new
            password.
          </p>

          <Link
            to="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-ridezo-primary-light hover:underline"
          >
            Request another reset code
          </Link>
        </section>
      </main>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError('');

    try {
      await resetPassword({
        resetToken,
        newPassword: values.password,
      });

      navigate('/login', {
        replace: true,
        state: {
          message:
            'Your password has been reset. Please log in with your new password.',
        },
      });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Unable to reset your password. Please try again.',
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ridezo-bg px-4 py-10 text-gray-100">
      <section className="w-full max-w-md rounded-2xl border border-ridezo-border bg-ridezo-surface p-6 shadow-2xl sm:p-8">
        <Link
          to="/login"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Ride<span className="text-ridezo-primary">zo</span>
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold">Create a new password</h1>

          <p className="mt-3 text-sm leading-6 text-ridezo-muted">
            Choose a strong password for your Ridezo account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-7 space-y-5"
        >
          <AuthInput
            id="password"
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            autoComplete="new-password"
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-gray-400 transition hover:text-white"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            }
            {...register('password')}
          />

          <AuthInput
            id="confirmPassword"
            label="Confirm new password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
                className="text-gray-400 transition hover:text-white"
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={16} />
                ) : (
                  <FiEye size={16} />
                )}
              </button>
            }
            {...register('confirmPassword')}
          />

          {serverError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-ridezo-primary px-4 py-3 text-sm font-semibold text-[#080B12] transition hover:bg-ridezo-primary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ridezo-muted">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-ridezo-primary-light hover:underline"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
