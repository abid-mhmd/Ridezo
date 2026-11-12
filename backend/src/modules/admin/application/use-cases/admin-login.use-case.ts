import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';

import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';

import type { IPasswordHasher } from '../../../auth/application/ports/passwordhasher';
import { PASSWORD_HASHER } from '../../../auth/application/ports/passwordhasher';

import type { IRefreshTokenStorage } from '../../../auth/application/ports/refresh-token-storage';
import { REFRESH_TOKEN_STORAGE } from '../../../auth/application/ports/refresh-token-storage';

import type { ITokenService } from '../../../auth/application/ports/token.service';
import { TOKEN_SERVICE } from '../../../auth/application/ports/token.service';

import {
  AccountStatus,
  UserRole,
} from '../../../users/domain/enums/user.enums';

import { API_MESSAGES } from '../../../../common/constants/message.constants';
import type { AdminLoginInput } from '../dto/admin-login.input';

import {
  IAdminLoginUseCase,
  type AdminLoginResult,
} from '../interfaces/admin-login.use-case.interface';

@Injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: IRefreshTokenStorage,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: AdminLoginInput): Promise<AdminLoginResult> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmailForAuthentication(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (
      !passwordIsValid ||
      user.role !== UserRole.ADMIN ||
      !user.emailVerified ||
      user.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const sessionId = randomBytes(16).toString('hex');
    const refreshTtl = this.tokenService.getRefreshTokenTtl();

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: sessionId,
      tokenType: 'refresh',
    });

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.refreshTokenStorage.store(
      sessionId,
      refreshTokenHash,
      refreshTtl,
    );

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokenService.getAccessTokenTtl(),
      refreshTtl,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
