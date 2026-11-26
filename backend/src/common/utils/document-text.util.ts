import { createHash } from 'node:crypto';

export class DocumentTextUtil {
  static normalize(rawText: string): string {
    return rawText
      .toUpperCase()
      .replace(/[^A-Z0-9/\-.\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static extractDates(normalizedText: string): Date[] {
    const matches = normalizedText.matchAll(
      /\b(\d{2})[-/.](\d{2})[-/.]((?:19|20)\d{2})\b/g,
    );

    const dates: Date[] = [];

    for (const match of matches) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);

      if (month < 1 || month > 12 || day < 1 || day > 31) continue;

      const parsed = new Date(Date.UTC(year, month - 1, day));
      if (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getUTCDate() === day &&
        parsed.getUTCMonth() === month - 1
      ) {
        dates.push(parsed);
      }
    }

    return dates;
  }

  static calculateNameMatchRatio(
    normalizedText: string,
    firstName: string,
    lastName?: string,
  ): number {
    const nameTokens = `${firstName} ${lastName ?? ''}`
      .toUpperCase()
      .replace(/[^A-Z\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length >= 2);

    if (nameTokens.length === 0) return 0;

    const matched = nameTokens.filter((token) =>
      normalizedText.includes(token),
    ).length;

    return matched / nameTokens.length;
  }

  static maskDocumentNumber(value: string): string {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleaned.length <= 6) return '****';
    return `${cleaned.slice(0, 4)}${'*'.repeat(cleaned.length - 8)}${cleaned.slice(-4)}`;
  }

  static hashDocumentNumber(value: string, pepper: string): string {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return createHash('sha256').update(`${cleaned}:${pepper}`).digest('hex');
  }
}
