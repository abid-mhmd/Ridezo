import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class OtpHasherService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('OTP_HASH_SECRET');
  }

  hash(email: string, otp: string): string {
    return createHmac('sha256', this.secret)
      .update(`${email.trim().toLocaleLowerCase()}:${otp}`)
      .digest('hex');
  }

  verify(email: string, otp: string, storedHash: string): boolean {
    const submitedHash = this.hash(email, otp);
    const submittedBuffer = Buffer.from(submitedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (
      submittedBuffer.length !== storedBuffer.length ||
      storedBuffer.length === 0
    ) {
      return false;
    }
    return timingSafeEqual(submittedBuffer, storedBuffer);
  }
}
