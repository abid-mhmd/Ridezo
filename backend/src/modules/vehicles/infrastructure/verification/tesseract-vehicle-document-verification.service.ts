import { Injectable, Inject } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

import { VEHICLE_DOCUMENT_STORAGE } from '../../application/ports/vehicle-document-storage';
import type { IVehicleDocumentStorage } from '../../application/ports/vehicle-document-storage';
import type {
  IVehicleDocumentVerification,
  ExtractedVehicleDocumentData,
} from '../../application/ports/vehicle-document-verification';
import { VehicleDocumentTextNormalizer } from './helpers/vehicle-document-text-normalizer';
import { VehicleRegistrationExtractor } from './helpers/vehicle-registration-extractor';
import { VehicleExpiryDateExtractor } from './helpers/vehicle-expiry-date-extractor';

@Injectable()
export class TesseractVehicleDocumentVerificationService implements IVehicleDocumentVerification {
  constructor(
    @Inject(VEHICLE_DOCUMENT_STORAGE)
    private readonly documentStorage: IVehicleDocumentStorage,
  ) {}

  async extractData(
    documentKey: string,
    mimeType: string,
  ): Promise<ExtractedVehicleDocumentData> {
    if (mimeType === 'application/pdf') {
      return {
        registrationNumber: null,
        expiryDate: null,
        isReadable: false,
      };
    }

    // Download errors should propagate as infrastructure errors.
    const { buffer } = await this.documentStorage.download(documentKey);

    let worker;

    try {
      worker = await createWorker('eng');

      const {
        data: { text },
      } = await worker.recognize(buffer);

      const normalizedText = VehicleDocumentTextNormalizer.normalize(text);

      return {
        registrationNumber:
          VehicleRegistrationExtractor.extract(normalizedText),

        expiryDate: VehicleExpiryDateExtractor.extract(normalizedText),

        isReadable: normalizedText.length > 0,
      };
    } catch {
      // OCR failure means the document needs manual review.
      return {
        registrationNumber: null,
        expiryDate: null,
        isReadable: false,
      };
    } finally {
      await worker?.terminate();
    }
  }
}
