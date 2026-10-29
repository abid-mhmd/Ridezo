export const API_MESSAGES = {
  AUTH: {
    REGISTRATION_SUCCESS: 'Registration successful.',
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    AUTHENTICATION_REQUIRED: 'Authentication required.',
    SESSION_EXPIRED: 'Session expired. Please log in again.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    PASSWORD_RESET_SUCCESS: 'Password reset successful. Please login again.',
    REFRESH_TOKEN_EXPIRED: 'Refresh token is invalid or expired.',
  },

  ADMIN: {
    LOGIN_SUCCESS: 'Admin login successful.',
    LOGOUT_SUCCESS: 'Admin logged out successfully.',
    SESSION_EXPIRED: 'Admin session expired. Please log in again.',
    INVALID_REFRESH_TOKEN: 'Invalid admin refresh token.',
    SESSION_INVALID: 'Admin session is no longer valid.',
  },

  USERS: {
    NOT_FOUND: 'User not found.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    PHOTO_REMOVED: 'Profile photo removed successfully.',
    INVALID_PHOTO_TYPE: 'Only JPEG, PNG, and WebP images are allowed.',
    PROFILE_PHOTO_REQUIRED: 'Profile photo is required.',
  },

  COMMON: {
    INTERNAL_SERVER_ERROR: 'Internal server error.',
  },
} as const;
