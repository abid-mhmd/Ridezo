import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/loginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';

import AppLayout from './layputs/AppLayout';
import ProfilePage from './features/auth/pages/ProfilePage';

import type { AuthUser } from './features/auth/types/auth.types';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  function handleLoginSuccess(token: string, authenticatedUser: AuthUser) {
    setAccessToken(token);
    setUser(authenticatedUser);
  }

  // function handleLogout() {
  //   setAccessToken(null);
  //   setUser(null);
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            accessToken && user ? (
              <Navigate to="/profile" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-reset-otp" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Authenticated application layout */}
        <Route
          element={
            accessToken && user ? (
              <AppLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to={accessToken && user ? '/profile' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
