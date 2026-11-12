import { Inject, Injectable } from '@nestjs/common';
import { OTP_STORAGE } from '../ports/otp-storage';
import type { IOtpStorage } from '../ports/otp-storage';
import { EMAIL_SENDER } from '../ports/email.sender';
import type { IEmailSender } from '../ports/email.sender';
import { OtpGeneratorService } from '../services/otp-generator.service';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { OtpHasherService } from '../services/otp-hasher.service';
import { PinoLogger } from 'nestjs-pino';
import type { ISendEmailOtpUseCase } from '../interfaces/send-email-otp.use-case.interface';

const OTP_EXPIRY_SECONDS = 300;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

@Injectable()
export class SendEmailOtpUseCase implements ISendEmailOtpUseCase {
  constructor(
    @Inject(OTP_STORAGE)
    private readonly otpStorage: IOtpStorage,

    @Inject(EMAIL_SENDER)
    private readonly emailSender: IEmailSender,

    private readonly otpGenrator: OtpGeneratorService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    private readonly otpHasher: OtpHasherService,

    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SendEmailOtpUseCase.name);
  }

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
      this.logger.warn('OTP request rejected: resend cooldown active');
      return;
    }

    const otp = this.otpGenrator.generate();
    const otpHash = this.otpHasher.hash(normalizedEmail, otp);

    try {
      await this.otpStorage.save(normalizedEmail, otpHash, OTP_EXPIRY_SECONDS);
      await this.emailSender.sendVerificationOtp(normalizedEmail, otp);
      this.logger.info('Email verification OTP sent successfully');
    } catch (error) {
      await this.otpStorage.delete(normalizedEmail);
      await this.otpStorage.releaseResendCooldown(normalizedEmail);

      this.logger.error(
        'Failed to send email verification OTP',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
