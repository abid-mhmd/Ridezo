export const INDIAN_STATE_CODES = new Set([
  'AN',
  'AP',
  'AR',
  'AS',
  'BR',
  'CG',
  'CH',
  'DD',
  'DL',
  'DN',
  'GA',
  'GJ',
  'HP',
  'HR',
  'JH',
  'JK',
  'KA',
  'KL',
  'LA',
  'LD',
  'MH',
  'ML',
  'MN',
  'MP',
  'MZ',
  'NL',
  'OD',
  'OR',
  'PB',
  'PY',
  'RJ',
  'SK',
  'TN',
  'TR',
  'TS',
  'UK',
  'UP',
  'WB',
]);

export const INDIAN_DL_REGEX =
  /\b([A-Z]{2})[-\s]?(\d{2})[-\s]?((?:19|20)\d{2})[-\s]?(\d{7})\b/;

export const DRIVING_LICENSE_KEYWORDS = [
  'DRIVING',
  'LICENCE',
  'LICENSE',
  'UNION OF INDIA',
  'TRANSPORT',
  'LMV',
  'MCWG',
  'COV',
  'VALID TILL',
  'AUTHORISATION',
] as const;

export const IDENTITY_VERIFICATION_SCORING = {
  DL_NUMBER_VALID: 35,
  KEYWORDS_MATCH: 15,
  EXPIRY_VALID: 25,
  NAME_STRONG_MATCH: 25,
  NAME_PARTIAL_MATCH: 15,

  AUTO_APPROVE_THRESHOLD: 85,
  MANUAL_REVIEW_THRESHOLD: 50,
  MIN_NAME_STRONG_RATIO: 0.75,
  MIN_NAME_PARTIAL_RATIO: 0.5,
  MIN_KEYWORDS_REQUIRED: 2,
} as const;

export const IDENTITY_DOCUMENT_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
};
