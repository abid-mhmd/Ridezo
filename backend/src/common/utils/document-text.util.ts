import { createHash } from 'crypto';

export class DocumentTextUtil {
  static normalize(raw: string): string {
    return raw
      .toUpperCase()
      .replace(/[^A-Z0-9/\-\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static extractDates(normalizedText: string): Date[] {
    const regex = /\b(\d{2})[/-](\d{2})[/-]((?:19|20)\d{2})\b/g;
    const dates: Date[] = [];

    for (const match of normalizedText.matchAll(regex)) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);

      if (month < 1 || month > 12 || day < 1 || day > 31) continue;
      const parsed = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(parsed.getTime())) {
        dates.push(parsed);
      }
    }

    return dates;
  }

  static getLatestDate(dates: Date[]): Date | null {
    if (dates.length === 0) return null;
    return dates.reduce((latest, current) =>
      current.getTime() > latest.getTime() ? current : latest,
    );
  }

  static calculateNameMatchRatio(
    fullName: string,
    normalizedText: string,
  ): number {
    const tokens = fullName
      .toUpperCase()
      .split(/\s+/)
      .map((t) => t.replace(/[^A-Z]/g, ''))
      .filter((t) => t.length >= 2);

    if (tokens.length === 0) return 0;

    const matched = tokens.filter((token) => normalizedText.includes(token));
    return matched.length / tokens.length;
  }

  static maskDocumentNumber(raw: string): string {
    const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length <= 6) return '****';
    return `${clean.slice(0, 4)}****${clean.slice(-4)}`;
  }

  static hashDocumentNumber(raw: string, pepper: string): string {
    const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return createHash('sha256').update(`${clean}:${pepper}`).digest('hex');
  }
}
