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
    PASSWORD_RESET_OTP_SUCCESS: 'Password reset OTP verified successfully.',
    REFRESH_TOKEN_EXPIRED: 'Refresh token is invalid or expired.',
    REFRESH_SUCCESS: 'Session refreshed successfully.',
    INVALID_OTP: 'Invalid or expired password-reset OTP.',
  },

  ADMIN: {
    LOGIN_SUCCESS: 'Admin login successful.',
    LOGOUT_SUCCESS: 'Admin logged out successfully.',
    SESSION_EXPIRED: 'Admin session expired. Please log in again.',
    INVALID_REFRESH_TOKEN: 'Invalid admin refresh token.',
    SESSION_INVALID: 'Admin session is no longer valid.',
    USER_RETRIEVED_SUCCESS: 'Users retrieved successfully.',
    USER_ACCOUNT_STATUS: 'User account status updated successfully.',
    INVALID_USER_ID: 'Invalid user ID.',
  },

  USERS: {
    NOT_FOUND: 'User not found.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    PHOTO_REMOVED: 'Profile photo removed successfully.',
    INVALID_PHOTO_TYPE: 'Only JPEG, PNG, and WebP images are allowed.',
    PROFILE_PHOTO_REQUIRED: 'Profile photo is required.',
    USER_RETRIEVED_SUCCESS: 'User details retrieved successfully.',
    OTP_SENT: 'If the request is eligible, a verfication code will be sent.',
  },

  COMMON: {
    INTERNAL_SERVER_ERROR: 'Internal server error.',
  },
} as const;
