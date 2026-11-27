export const RECURRING_RIDE_DEFAULTS = {
  TIMEZONE: 'Asia/Kolkata',
  IST_OFFSET: '+05:30',
  GENERATE_AHEAD_DAYS: 7,
  MAX_GENERATE_AHEAD_DAYS: 14,
  MIN_WEEKDAY: 0, // Sunday
  MAX_WEEKDAY: 6, // Saturday
} as const;
