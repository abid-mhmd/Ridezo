import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/loginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import { logoutUser } from './features/auth/api/auth.api';

import AppLayout from './layputs/AppLayout';
import ProfilePage from './features/user/pages/ProfilePage';
import EditProfilePage from './features/user/pages/EditProfilePage';

import type { AuthUser } from './features/auth/types/auth.types';
import { setAccessToken, restoreSession } from './api/http';
import { getMyProfile } from './features/user/api/profile.api';
import AdminLoginPage from './features/admin/auth/pages/AdminLoginPage';
import AdminUsersPage from './features/admin/users/pages/AdminUsersPage';
import AdminLayout from './features/admin/components/AdminLayout';

function App() {
  // Regular user session
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Separate admin session
  const [adminAccessToken, setAdminAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const token = await restoreSession();

        if (!token) {
          return;
        }

        const profile = await getMyProfile();

        if (!isMounted) {
          return;
        }

        const authenticatedUser: AuthUser = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          role: profile.role,
        };

        setAccessToken(token);
        setAccessTokenState(token);
        setUser(authenticatedUser);
      } catch {
        setAccessToken(null);

        if (isMounted) {
          setAccessTokenState(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLoginSuccess(token: string, authenticatedUser: AuthUser) {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(authenticatedUser);
  }

  // Store the admin token separately from the user token.
  function handleAdminLoginSuccess(token: string) {
    setAdminAccessToken(token);
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  }

  function handleAdminLogout() {
    setAdminAccessToken(null);
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-sm text-gray-400">
        Restoring your Ridezo session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Regular user authentication */}
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

        <Route
          path="/admin/login"
          element={
            adminAccessToken ? (
              <Navigate to="/admin/users" replace />
            ) : (
              <AdminLoginPage
                onLoginSuccess={(token) => handleAdminLoginSuccess(token)}
              />
            )
          }
        />

        <Route
          path="/admin"
          element={
            adminAccessToken ? (
              <AdminLayout onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/admin/users" replace />} />

          <Route
            path="users"
            element={<AdminUsersPage accessToken={adminAccessToken!} />}
          />
        </Route>

        {/* Regular user protected routes */}
        <Route
          element={
            accessToken && user ? (
              <AppLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
        </Route>

        {/* Fallback */}
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
