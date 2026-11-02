import { Inject, Injectable } from '@nestjs/common';
import type { ITokenService } from '../../../auth/application/ports/token.service.js';
import { TOKEN_SERVICE } from '../../../auth/application/ports/token.service.js';
import { createHash } from 'node:crypto';
import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage.js';
import type { IRefreshTokenStorage } from '../ports/refresh-token-storage.js';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: IRefreshTokenStorage,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = await this.tokenService.verifyRefreshToken<{
        jti: string;
        tokenType: string;
      }>(refreshToken);

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
