export interface ScheduledOccurrence {
  occurrenceDate: string;
  departureTime: Date;
  dayOfWeek: number;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function toIstDateString(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildIstDepartureDate(dateStr: string, timeHHmm: string): Date {
  return new Date(`${dateStr}T${timeHHmm}:00+05:30`);
}

export function getIstDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00+05:30`).getUTCDay();
}

export function computeUpcomingOccurrences(params: {
  daysOfWeek: number[];
  departureTime: string;
  startDate: Date;
  endDate?: Date | null;
  generateAheadDays: number;
  now?: Date;
}): ScheduledOccurrence[] {
  const now = params.now ?? new Date();
  const daySet = new Set(params.daysOfWeek);
  const startStr = toIstDateString(params.startDate);
  const endStr = params.endDate ? toIstDateString(params.endDate) : null;

  const occurrences: ScheduledOccurrence[] = [];

  for (let offset = 0; offset < params.generateAheadDays; offset++) {
    const candidate = new Date(now.getTime() + offset * DAY_MS);
    const dateStr = toIstDateString(candidate);

    if (dateStr < startStr) continue;
    if (endStr && dateStr > endStr) break;

    const dayOfWeek = getIstDayOfWeek(dateStr);
    if (!daySet.has(dayOfWeek)) continue;

    const departureDate = buildIstDepartureDate(dateStr, params.departureTime);
    if (departureDate <= now) continue;

    occurrences.push({
      occurrenceDate: dateStr,
      departureTime: departureDate,
      dayOfWeek,
    });
  }

  return occurrences;
}
