import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.js';
import { OTP_STORAGE } from '../ports/otp-storage.js';
import type { IOtpStorage } from '../ports/otp-storage.js';
import { OtpHasherService } from '../services/otp-hasher.service.js';
import { PinoLogger } from 'nestjs-pino';

export class InvalidEmailOtpError extends Error {
  constructor() {
    super('The verification code is invalid or expired.');
    this.name = 'InvalidEmailOtpError';
  }
}

export class TooManyOtpAttemptsError extends Error {
  constructor() {
    super('Too many verification attempts. Request a new code.');
    this.name = 'TooManyOtpAttemptsError';
  }
}

const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_SECONDS = 300;

@Injectable()
export class VerifyEmailOtpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(OTP_STORAGE)
    private readonly otpStorage: IOtpStorage,

    private readonly otpHasher: OtpHasherService,

    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(VerifyEmailOtpUseCase.name);
  }

  async execute(email: string, otp: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || user.emailVerified) {
      throw new InvalidEmailOtpError();
    }

    const storedHash = await this.otpStorage.find(normalizedEmail);

    if (!storedHash) {
      throw new InvalidEmailOtpError();
    }

    const attempts = await this.otpStorage.incrementAttempts(
      normalizedEmail,
      OTP_EXPIRY_SECONDS,
    );

    if (attempts > MAX_OTP_ATTEMPTS) {
      await this.otpStorage.delete(normalizedEmail);
      this.logger.warn('OTP verification blocked: maximum attempts exceeded');
      throw new TooManyOtpAttemptsError();
    }

    const isValid = this.otpHasher.verify(normalizedEmail, otp, storedHash);

    if (!isValid) {
      this.logger.warn('OTP verification failed: invalid code');
      throw new InvalidEmailOtpError();
    }

    await this.userRepository.markEmailVerified(user.id);
    await this.otpStorage.delete(normalizedEmail);
    this.logger.info('Email verification completed successfully');
  }
}
