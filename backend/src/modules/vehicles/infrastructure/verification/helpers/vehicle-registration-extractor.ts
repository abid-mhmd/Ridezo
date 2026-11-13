import { VehicleDocumentTextNormalizer } from './vehicle-document-text-normalizer';

export class VehicleRegistrationExtractor {
  static extract(text: string): string | null {
    const normalizedText = VehicleDocumentTextNormalizer.normalize(text);

    const match = normalizedText.match(
      /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}\b/,
    );

    if (!match) {
      return null;
    }

    return VehicleDocumentTextNormalizer.normalizeRegistrationNumber(match[0]);
  }
}
