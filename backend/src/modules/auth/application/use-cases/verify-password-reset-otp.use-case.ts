import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  PASSWORD_RESET_STORAGE,
  type PasswordResetStorage,
} from '../ports/password-reset-storage.js';
import { OtpHasherService } from '../services/otp-hasher.service.js';

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
    private readonly passwordResetStorage: PasswordResetStorage,

    private readonly otpHasherService: OtpHasherService,

    private readonly jwtService: JwtService,
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

    const resetToken = await this.jwtService.signAsync(
      {
        sub: stored.userId,
        purpose: 'password_reset',
      },
      {
        expiresIn: '10m',
      },
    );
    return { resetToken };
  }
}
