import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { PASSWORD_HASHER } from '../ports/passwordhasher.js';
import type { PasswordHasher } from '../ports/passwordhasher.js';
import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../ports/refresh-token-storage.js';
import { LoginUserDto } from '../dto/login-user.dto.js';
import {
  UserRole,
  AccountStatus,
} from '../../../users/domain/enums/user.enums.js';
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: LoginUserDto): Promise<LoginUserResult> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmailForAuthentication(email);

    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new InvalidCredentialsError();
    }

    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      throw new EmailNotVerifiedError();
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active.');
    }

    const sessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TTL_SECONDS',
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: sessionId,
        tokenType: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.refreshTokenStorage.store(
      sessionId,
      refreshTokenHash,
      refreshTtl,
    );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900,
      refreshTtl,
    };
  }
}
