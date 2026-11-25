export const IDENTITY_VERIFICATION_CONFIG = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,

  THRESHOLDS: {
    AUTO_APPROVE: 85,
    MANUAL_REVIEW: 50,
    NAME_MATCH_MIN_RATIO: 0.7,
  },

  WEIGHTS: {
    DL_NUMBER_VALID: 35,
    DL_KEYWORDS_PRESENT: 15,
    EXPIRY_VALID: 25,
    NAME_MATCH: 25,
  },

  // Official Indian State & UT RTO prefixes
  INDIAN_STATE_CODES: new Set([
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
  ]),

  DL_MARKERS: [
    'DRIVING',
    'LICENCE',
    'LICENSE',
    'UNION OF INDIA',
    'TRANSPORT',
    'LMV',
    'MCWG',
    'COV',
    'VALID TILL',
    'NT',
  ],

  // Matches e.g. KL0720210012345, KL-07 20210012345, DL14 20190012345
  INDIAN_DL_REGEX:
    /\b([A-Z]{2})[-\s]?(\d{2})[-\s]?((?:19|20)\d{2})[-\s]?(\d{7})\b/,
} as const;
