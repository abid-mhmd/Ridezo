import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import {
  PASSWORD_RESET_STORAGE,
  type PasswordResetStorage,
} from '../ports/password-reset-storage.js';
import { EMAIL_SENDER } from '../ports/email.sender.js';
import type { EmailSender } from '../ports/email.sender.js';
import { OtpGeneratorService } from '../services/otp-generator.service.js';
import { OtpHasherService } from '../services/otp-hasher.service.js';
import { AccountStatus } from '../../../users/domain/enums/user.enums.js';

@Injectable()
export class RequestPasswordResetOtpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_RESET_STORAGE)
    private readonly passwordResetStorage: PasswordResetStorage,

    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,

    private readonly otpGenerator: OtpGeneratorService,
    private readonly otpHasher: OtpHasherService,
  ) {}

  async execute(input: string): Promise<boolean> {
    const email = input.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);

    // Do not reveal whether the account exists.
    if (
      !user ||
      !user.emailVerified ||
      !user.passwordHash ||
      user.accountStatus !== AccountStatus.ACTIVE
    ) {
      return false;
    }

    // Prevent repeated OTP requests.
    const cooldownAcquired = await this.passwordResetStorage.acquireCooldown(
      email,
      60,
    );

    if (!cooldownAcquired) {
      return false;
    }

    const otp = this.otpGenerator.generate();
    const otpHash = this.otpHasher.hash(email, otp);

    try {
      // Store the OTP hash, not the plaintext OTP.
      await this.passwordResetStorage.save(email, otpHash, user.id, 300);
      await this.emailSender.sendVerificationOtp(email, otp);
      return true;
    } catch (error) {
      await this.passwordResetStorage.delete(email);
      await this.passwordResetStorage.releaseCooldown(email);

      throw error;
    }
  }
}
