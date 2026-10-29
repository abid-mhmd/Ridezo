export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',

    EMAIL_OTP:'email-otp',
    VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
    RESEND_EMAIL_OTP: '/auth/resend-otp',

    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',

    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
  },

  USERS: {
    ME: '/users/me',
    PROFILE: '/users/profile',
    PROFILE_PHOTO: '/users/profile/photo',
  },

  ADMIN: {
    LOGIN: '/admin/login',
    REFRESH: '/admin/refresh',
    LOGOUT: '/admin/logout',

    USERS: '/admin/users',
    USER_BY_ID: '/admin/users/:userId',
    UPDATE_USER_STATUS: '/admin/users/:userId/status',
  },
} as const;
