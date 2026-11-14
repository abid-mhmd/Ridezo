import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { PASSWORD_HASHER } from '../ports/passwordhasher';
import type { IPasswordHasher } from '../ports/passwordhasher';
import { AccountStatus } from '../../../users/domain/enums/user.enums';
import type { ITokenService } from '../ports/token.service';
import { TOKEN_SERVICE } from '../ports/token.service';
import { IResetPasswordUseCase } from '../interfaces/reset-password.use-case.interface';

export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Invalid or expired password-reset authorization.');
    this.name = 'InvalidPasswordResetTokenError';
  }
}

@Injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(resetToken: string, newPassword: string): Promise<void> {
    let payload: { sub: string; purpose: string };

    try {
      payload = await this.tokenService.verifyAccessToken<{
        sub: string;
        purpose: string;
      }>(resetToken);
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
      !user.emailVerified
    ) {
      throw new InvalidPasswordResetTokenError();
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);

    await this.userRepository.updatePasswordHash(payload.sub, passwordHash);
  }
}
