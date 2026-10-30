import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { REFRESH_TOKEN_STORAGE } from '../../../auth/application/ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../../../auth/application/ports/refresh-token-storage.js';

@Injectable()
export class AdminLogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = await this.jwtService.verifyAsync<{
        jti: string;
        tokenType: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (!payload.jti || payload.tokenType !== 'refresh') return;

      const incomingHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      const storedHash = await this.refreshTokenStorage.get(payload.jti);

      if (storedHash === incomingHash) {
        await this.refreshTokenStorage.delete(payload.jti);
      }
    } catch {
      // Invalid or expired token: logout still succeeds.
    }
  }
}
