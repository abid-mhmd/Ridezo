import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class OtpGeneratorService {
  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }
}
