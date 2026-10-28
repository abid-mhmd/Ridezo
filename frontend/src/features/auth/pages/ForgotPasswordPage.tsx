import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import AuthInput from '../../../components/AuthInput';
import { forgotPassword } from '../api/auth.api';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/auth.schema';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError('');

    try {
      const email = values.email.trim().toLowerCase();

      const response = await forgotPassword({ email });

      if (!response.otpSent) {
        setServerError(
          'Unable to process this email.Please check you email address.',
        );
        return;
      }

      navigate('/verify-reset-otp', {
        state: { email },
      });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Unable to process your request. Please try again.',
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
          <Link
            to="/login"
            className="text-sm text-ridezo-muted transition hover:text-white"
          >
            ← Back to login
          </Link>

          <h1 className="mt-6 text-2xl font-semibold">Forgot your password?</h1>

          <p className="mt-3 text-sm leading-6 text-ridezo-muted">
            Enter the email address associated with your Ridezo account. We'll
            send you a verification code to reset your password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-7 space-y-5"
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
            {isSubmitting ? 'Sending code...' : 'Send verification code'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-ridezo-muted">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-ridezo-primary-light transition hover:underline"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
