import { Inject, Injectable } from '@nestjs/common';
import { OTP_STORAGE } from '../ports/otp-storage.js';
import type { OtpStorage } from '../ports/otp-storage.js';
import { EMAIL_SENDER } from '../ports/email.sender.js';
import type { EmailSender } from '../ports/email.sender.js';
import { OtpGeneratorService } from '../services/otp-generator.service.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { OtpHasherService } from '../services/otp-hasher.service.js';

const OTP_EXPIRY_SECONDS = 300;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

@Injectable()
export class SendEmailOtpUseCase {
  constructor(
    @Inject(OTP_STORAGE)
    private readonly otpStorage: OtpStorage,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
    private readonly otpGenrator: OtpGeneratorService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly otpHasher: OtpHasherService,
  ) {}

  async execute(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || user.emailVerified) {
      return;
    }

    const cooldownAcquired = await this.otpStorage.acquireResendCooldown(
      normalizedEmail,
      OTP_RESEND_COOLDOWN_SECONDS,
    );

    if (!cooldownAcquired) {
      return;
    }
    const otp = this.otpGenrator.generate();
    const otpHash = this.otpHasher.hash(normalizedEmail, otp);

    await this.otpStorage.save(normalizedEmail, otpHash, OTP_EXPIRY_SECONDS);
    await this.emailSender.sendVerificationOtp(normalizedEmail, otp);
  }
}
