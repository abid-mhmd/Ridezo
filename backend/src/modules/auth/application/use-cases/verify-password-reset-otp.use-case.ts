import { Inject, Injectable } from '@nestjs/common';
import {
  PASSWORD_RESET_STORAGE,
  type IPasswordResetStorage,
} from '../ports/password-reset-storage';
import { OtpHasherService } from '../services/otp-hasher.service';
import { TOKEN_SERVICE } from '../ports/token.service';
import type { ITokenService } from '../ports/token.service';

export class InvalidPasswordResetOtpError extends Error {
  constructor() {
    super('Invalid or expired password-reset OTP.');
    this.name = 'InvalidPasswordResetOtpError';
  }
}

export class TooManyPasswordResetAttemptsError extends Error {
  constructor() {
    super('Too many password-reset OTP attempts.');
    this.name = 'TooManyPasswordResetAttemptsError';
  }
}

@Injectable()
export class VerifyPasswordResetOtpUseCase {
  constructor(
    @Inject(PASSWORD_RESET_STORAGE)
    private readonly passwordResetStorage: IPasswordResetStorage,

    private readonly otpHasherService: OtpHasherService,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(email: string, otp: string): Promise<{ resetToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const stored = await this.passwordResetStorage.find(normalizedEmail);

    if (!stored) {
      throw new InvalidPasswordResetOtpError();
    }

    const attempts = await this.passwordResetStorage.incrementAttempts(
      normalizedEmail,
      300,
    );

    if (attempts > 5) {
      await this.passwordResetStorage.delete(normalizedEmail);
      throw new TooManyPasswordResetAttemptsError();
    }

    const isValid = this.otpHasherService.verify(
      normalizedEmail,
      otp,
      stored.otpHash,
    );

    if (!isValid) {
      throw new InvalidPasswordResetOtpError();
    }

    await this.passwordResetStorage.delete(normalizedEmail);

    const resetToken = await this.tokenService.generatePasswordResetToken({
      sub: stored.userId,
      purpose: 'password_reset',
    });
    return { resetToken };
  }
}
