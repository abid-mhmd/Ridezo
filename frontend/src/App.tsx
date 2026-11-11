import { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import LoginPage from './features/auth/pages/loginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import { logoutUser } from './features/auth/api/auth.api';

import AppLayout from './layouts/AppLayout';
import ProfilePage from './features/user/pages/ProfilePage';
import EditProfilePage from './features/user/pages/EditProfilePage';

import type { AuthUser } from './features/auth/types/auth.types';
import { setAccessToken, restoreSession } from './api/http';
import { getMyProfile } from './features/user/api/profile.api';
import AdminLoginPage from './features/admin/auth/pages/AdminLoginPage';
import AdminUsersPage from './features/admin/users/pages/AdminUsersPage';
import AdminLayout from './features/admin/components/AdminLayout';
import AdminUserDetailsPage from './features/admin/users/pages/AdmiUserDetailsPage';
import {
  refreshAdminSession,
  logoutAdmin,
} from './features/admin/auth/api/admin-auth.api';
import VehiclesPage from './features/vehicles/pages/VehiclesPage';
import AddVehiclePage from './features/vehicles/pages/AddVehiclePage';
import EditVehiclePage from './features/vehicles/pages/EditVehiclePage';

function GoogleCallbackHandler({
  onLoginSuccess,
}: {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function completeGoogleLogin() {
      try {
        const token = await restoreSession();

        if (!token) {
          throw new Error('Unable to restore Google login session.');
        }

        const profile = await getMyProfile();

        if (!isMounted) return;

        const authenticatedUser: AuthUser = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          role: profile.role,
        };

        onLoginSuccess(token, authenticatedUser);
        navigate('/profile', { replace: true });
      } catch {
        if (isMounted) {
          navigate('/login?error=google-login-failed', {
            replace: true,
          });
        }
      }
    }

    void completeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, onLoginSuccess]);

  return <div>Signing you in...</div>;
}

const FullScreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-sm text-gray-400">
    Restoring your session...
  </div>
);

function App() {
  const isInitialAdminPath = window.location.pathname.startsWith('/admin');

  // Regular user session
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(!isInitialAdminPath);

  // Separate admin session
  const [adminAccessToken, setAdminAccessToken] = useState<string | null>(null);
  const [isAdminInitializing, setIsAdminInitializing] =
    useState(isInitialAdminPath);

  useEffect(() => {
    function handleSessionExpired() {
      setAccessToken(null);
      setAccessTokenState((prev) => (prev !== null ? null : prev));
      setUser((prev) => (prev !== null ? null : prev));
    }

    window.addEventListener('ridezo:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener(
        'ridezo:session-expired',
        handleSessionExpired,
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeActiveSession() {
      if (window.location.pathname.startsWith('/admin')) {
        try {
          const session = await refreshAdminSession();
          if (isMounted) {
            setAdminAccessToken(session.accessToken);
          }
        } catch {
          if (isMounted) {
            setAdminAccessToken(null);
          }
        } finally {
          if (isMounted) {
            setIsAdminInitializing(false);
            setIsInitializing(false);
          }
        }
      } else {
        try {
          const token = await restoreSession();
          if (!token) return;

          const profile = await getMyProfile();
          if (!isMounted) return;

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
            setIsAdminInitializing(false);
          }
        }
      }
    }

    void initializeActiveSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = useCallback(
    (token: string, authenticatedUser: AuthUser) => {
      setAccessToken(token);
      setAccessTokenState(token);
      setUser(authenticatedUser);
    },
    [],
  );

  const handleAdminLoginSuccess = useCallback((token: string) => {
    setAdminAccessToken(token);
  }, []);

  const handleLogout = useCallback(async () => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);

    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }, []);

  const handleAdminLogout = useCallback(async () => {
    setAdminAccessToken(null);

    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Admin logout request failed:', error);
    } finally {
      window.location.replace('/admin/login');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Regular user authentication */}
        <Route
          path="/login"
          element={
            isInitializing ? (
              <FullScreenLoader />
            ) : accessToken && user ? (
              <Navigate to="/profile" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/auth/google/callback"
          element={
            <GoogleCallbackHandler onLoginSuccess={handleLoginSuccess} />
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
            isAdminInitializing ? (
              <FullScreenLoader />
            ) : adminAccessToken ? (
              <Navigate to="/admin/users" replace />
            ) : (
              <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
            )
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            isAdminInitializing ? (
              <FullScreenLoader />
            ) : adminAccessToken ? (
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
          <Route
            path="users/:userId"
            element={<AdminUserDetailsPage accessToken={adminAccessToken!} />}
          />
        </Route>

        {/* Regular user protected routes */}
        <Route
          element={
            isInitializing ? (
              <FullScreenLoader />
            ) : accessToken && user ? (
              <AppLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/add" element={<AddVehiclePage />} />
          <Route
            path="/vehicles/:vehicleId/edit"
            element={<EditVehiclePage />}
          />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            isInitializing || isAdminInitializing ? (
              <FullScreenLoader />
            ) : window.location.pathname.startsWith('/admin') ? (
              <Navigate
                to={adminAccessToken ? '/admin/users' : '/admin/login'}
                replace
              />
            ) : accessToken && user ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;