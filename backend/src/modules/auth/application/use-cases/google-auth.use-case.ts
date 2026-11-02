import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../ports/refresh-token-storage.js';
import type { ITokenService } from '../ports/token.service.js';
import { TOKEN_SERVICE } from '../ports/token.service.js';

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  emailVerified: boolean;
}

export class GoogleAccountLinkRequiredError extends Error {
  constructor() {
    super('Please log in to your existing account before linking Google.');
    this.name = 'GoogleAccountLinkRequiredError';
  }
}

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(profile: GoogleProfile): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTtl: number;
    user: UserEntity;
  }> {
    if (!profile.emailVerified) {
      throw new Error('Google email verification is required.');
    }

    let user = await this.userRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingUser = await this.userRepository.findByEmail(
        profile.email.trim().toLowerCase(),
      );

      if (existingUser) {
        throw new GoogleAccountLinkRequiredError();
      }

      user = await this.userRepository.create({
        email: profile.email.trim().toLowerCase(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        googleId: profile.googleId,
        profilePhoto: profile.profilePhoto,
        emailVerified: true,
      });
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
      refreshTtl,
      user,
    };
  }
}
