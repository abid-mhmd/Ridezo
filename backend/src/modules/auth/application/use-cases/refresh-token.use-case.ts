import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../ports/refresh-token-storage.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  tokenType: 'refresh';
}

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    if (!payload.sub || !payload.jti || payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const incomingHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedHash = await this.refreshTokenStorage.get(payload.jti);

    if (!storedHash || storedHash !== incomingHash) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      await this.refreshTokenStorage.delete(payload.jti);

      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const newSessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TTL_SECONDS',
    );

    const newRefreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: newSessionId,
        tokenType: 'refresh',
      },
      {
        secret: refreshSecret,
        expiresIn: refreshTtl,
      },
    );

    const newRefreshHash = createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    const rotated = await this.refreshTokenStorage.rotate(
      payload.jti,
      storedHash,
      newSessionId,
      newRefreshHash,
      refreshTtl,
    );

    if (!rotated) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
