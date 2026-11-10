import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { UserEntity } from '../../../users/domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { PASSWORD_HASHER } from '../ports/passwordhasher';
import type { IPasswordHasher } from '../ports/passwordhasher';
import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage';
import type { IRefreshTokenStorage } from '../ports/refresh-token-storage';
import { LoginUserDto } from '../dto/login-user.dto';
import {
  UserRole,
  AccountStatus,
} from '../../../users/domain/enums/user.enums';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import type { ITokenService } from '../ports/token.service';
import { TOKEN_SERVICE } from '../ports/token.service';
import { PinoLogger } from 'nestjs-pino';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Please verify your email before logging in.');
    this.name = 'EmailNotVerifiedError';
  }
}

export interface LoginUserResult {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTtl: number;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: IRefreshTokenStorage,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,

    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(LoginUserUseCase.name);
  }

  async execute(input: LoginUserDto): Promise<LoginUserResult> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmailForAuthentication(email);

    if (!user || !user.passwordHash) {
      this.logger.warn('Login failed: invalid credentials');
      throw new InvalidCredentialsError();
    }

    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      this.logger.warn('Login failed: invalid credentials');
      throw new InvalidCredentialsError();
    }

    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      this.logger.warn('Login failed: email not verified');
      throw new EmailNotVerifiedError();
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active.');
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

    this.logger.info({ userId: user.id }, 'User logged in successfully');

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.tokenService.getAccessTokenTtl(),
      refreshTtl,
    };
  }
}
