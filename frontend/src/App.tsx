import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/loginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';

import type { AuthUser } from './features/auth/types/auth.types';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  function handleLoginSuccess(token: string, authenticatedUser: AuthUser) {
    setAccessToken(token);
    setUser(authenticatedUser);
  }

  if (accessToken && user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ridezo-bg px-6 text-gray-100">
        <section className="rounded-2xl border border-ridezo-border bg-ridezo-surface p-8">
          <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>

          <p className="mt-3 text-gray-400">You are signed in to Ridezo.</p>

          <button
            type="button"
            className="mt-6 rounded-lg bg-ridezo-primary px-4 py-2 font-semibold text-gray-950"
            onClick={() => {
              setAccessToken(null);
              setUser(null);
            }}
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
