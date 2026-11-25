// src/infrastructure/ocr/tesseract-ocr.service.ts
import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

export const OCR_SERVICE = Symbol('OCR_SERVICE');

export interface IOcrService {
  extractText(buffer: Buffer): Promise<string>;
}

@Injectable()
export class TesseractOcrService implements IOcrService {
  async extractText(buffer: Buffer): Promise<string> {
    let worker: Awaited<ReturnType<typeof createWorker>> | undefined;

    try {
      worker = await createWorker('eng');
      const {
        data: { text },
      } = await worker.recognize(buffer);
      return text ?? '';
    } catch {
      return '';
    } finally {
      await worker?.terminate();
    }
  }
}
