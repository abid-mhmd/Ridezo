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

export const IDENTITY_VERIFICATION_RULES = {
  MIN_KEYWORDS_REQUIRED: 2,
  MIN_NAME_MATCH_RATIO: 0.5,
} as const;

export const IDENTITY_DOCUMENT_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
};
