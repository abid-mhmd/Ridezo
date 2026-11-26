import { Module } from '@nestjs/common';
import { OCR_SERVICE } from './ocr.port';
import { TesseractOcrService } from './tesseract-ocr.service';

@Module({
  providers: [
    {
      provide: OCR_SERVICE,
      useClass: TesseractOcrService,
    },
  ],
  exports: [OCR_SERVICE],
})
export class OcrModule {}
