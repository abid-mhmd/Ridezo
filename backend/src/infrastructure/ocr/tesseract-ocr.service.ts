import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import type { IOcrService } from './ocr.port';

@Injectable()
export class TesseractOcrService implements IOcrService {
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (!mimeType.startsWith('image/')) {
      return '';
    }

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
