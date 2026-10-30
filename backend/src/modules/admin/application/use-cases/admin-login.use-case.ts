import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { PasswordHasher } from '../../../auth/application/ports/passwordhasher.js';
import { PASSWORD_HASHER } from '../../../auth/application/ports/passwordhasher.js';
import type { RefreshTokenStorage } from '../../../auth/application/ports/refresh-token-storage.js';
import { REFRESH_TOKEN_STORAGE } from '../../../auth/application/ports/refresh-token-storage.js';
import type { TokenGenerator } from '../ports/token.generator.js';
import { TOKEN_GENERATOR } from '../ports/token.generator.js';
import {
  AccountStatus,
  UserRole,
} from '../../../users/domain/enums/user.enums.js';
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';
import type { AdminLoginInput } from '../dto/admin-login.input.js';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,

    private readonly configService: ConfigService,
  ) {}

  async execute(input: AdminLoginInput) {
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

    const refreshTtl = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TTL_SECONDS',
    );

    const refreshToken = await this.tokenGenerator.generateRefreshToken({
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

    const accessToken = await this.tokenGenerator.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      refreshTtl,
      user,
    };
  }
}
