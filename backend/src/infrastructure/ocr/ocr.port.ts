export const OCR_SERVICE = Symbol('OCR_SERVICE');

export interface IOcrService {
  extractText(buffer: Buffer, mimeType: string): Promise<string>;
}
