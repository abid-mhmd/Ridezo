export class VehicleDocumentTextNormalizer {
  static normalize(text: string): string {
    return text
      .toUpperCase()
      .replace(/[ \t]+/g, ' ')
      .replace(/\r\n/g, '\n')
      .trim();
  }

  static normalizeRegistrationNumber(value: string): string {
    return value.replace(/[\s-]/g, '').toUpperCase();
  }
}
