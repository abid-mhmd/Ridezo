export class VehicleExpiryDateExtractor {
  private static readonly MONTHS: Record<string, number> = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
  };

  private static readonly DATE_PATTERN =
    /(\d{1,2})\s*[-/. ]\s*(\d{1,2}|JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUN(?:E)?|JUL(?:Y)?|AUG(?:UST)?|SEP(?:TEMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?)\s*[-/. ]\s*(\d{4})/gi;

  private static readonly EXPIRY_LABEL_PATTERN =
    /(?:VALIDITY\s*(?:UP\s*TO|UNTIL)|VALID\s*(?:UP\s*TO|UNTIL)|EXPIRY\s*DATE|EXPIRES\s*ON|POLICY\s*END\s*DATE|INSURANCE\s*VALID\s*(?:UP\s*TO|UNTIL)|CERTIFICATE\s*VALID\s*(?:UP\s*TO|UNTIL))\s*[:.-]?\s*/i;

  private static readonly COVERAGE_PERIOD_PATTERN =
    /PERIOD\s+OF\s+(?:COVER|INSURANCE)\s*:?\s*(?:FROM\s*)?/i;

  static extract(text: string): Date | null {
    const normalizedText = text.toUpperCase().replace(/\s+/g, ' ');

    // Handle insurance coverage periods: FROM date TO date.
    const coverageMatch = this.COVERAGE_PERIOD_PATTERN.exec(normalizedText);

    if (coverageMatch) {
      const remainingText = normalizedText.slice(
        coverageMatch.index + coverageMatch[0].length,
      );

      const toIndex = remainingText.search(/\bTO\b/);

      if (toIndex !== -1) {
        const expiryText = remainingText.slice(toIndex + 2);
        const dateMatch = this.DATE_PATTERN.exec(expiryText);

        if (dateMatch) {
          return this.parseDate(dateMatch);
        }
      }
    }

    // Handle PUC and other explicitly labelled expiry dates.
    const labelMatch = this.EXPIRY_LABEL_PATTERN.exec(normalizedText);

    if (!labelMatch) {
      return null;
    }

    const remainingText = normalizedText.slice(
      labelMatch.index + labelMatch[0].length,
    );

    const dateMatch = this.DATE_PATTERN.exec(remainingText);

    return dateMatch ? this.parseDate(dateMatch) : null;
  }

  private static parseDate(match: RegExpExecArray): Date | null {
    const day = Number(match[1]);
    const monthValue = match[2];
    const year = Number(match[3]);

    const month = /^\d+$/.test(monthValue)
      ? Number(monthValue)
      : this.MONTHS[monthValue.slice(0, 3)];

    if (!month || month < 1 || month > 12) {
      return null;
    }

    if (day < 1 || day > 31 || year < 1900 || year > 9999) {
      return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }
}
