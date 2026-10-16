import { Inject, Injectable } from '@nestjs/common';
import { OTP_STORAGE } from '../ports/otp-storage.js';
import type { OtpStorage } from '../ports/otp-storage.js';
import { OtpGeneratorService } from '../services/otp-generator.service.js';

const OTP_EXPIRY_SECONDS = 300;

@Injectable()
export class SendEmailOtpUseCase {
  constructor(
    @Inject(OTP_STORAGE)
    private readonly otpStorage: OtpStorage,
    private readonly otpGenrator: OtpGeneratorService,
  ) {}

  async execute(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = this.otpGenrator.generate();

    await this.otpStorage.save(normalizedEmail, otp, OTP_EXPIRY_SECONDS);
  }
}
