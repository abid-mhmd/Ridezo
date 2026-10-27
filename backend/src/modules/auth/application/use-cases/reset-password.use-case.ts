import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { PASSWORD_HASHER } from '../ports/passwordhasher.js';
import type { PasswordHasher } from '../ports/passwordhasher.js';
import { AccountStatus } from '../../../users/domain/enums/user.enums.js';

export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Invalid or expired password-reset authorization.');
    this.name = 'InvalidPasswordResetTokenError';
  }
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    private readonly jwtService: JwtService,
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    let payload: { sub: string; purpose: string };

    try {
      payload = await this.jwtService.verifyAsync(resetToken);
    } catch {
      throw new InvalidPasswordResetTokenError();
    }

    if (
      typeof payload.sub !== 'string' ||
      payload.purpose !== 'password_reset'
    ) {
      throw new InvalidPasswordResetTokenError();
    }

    const user = await this.userRepository.findById(payload.sub);

    if (
      !user ||
      user.accountStatus !== AccountStatus.ACTIVE ||
      !user.emailVerified ||
      !user.passwordHash
    ) {
      throw new InvalidPasswordResetTokenError();
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);

    await this.userRepository.updatePasswordHash(payload.sub, passwordHash);
  }
}
