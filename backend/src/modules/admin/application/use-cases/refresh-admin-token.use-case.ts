import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ITokenService } from '../../../auth/application/ports/token.service';
import { TOKEN_SERVICE } from '../../../auth/application/ports/token.service';
import { createHash, randomBytes } from 'node:crypto';

import { REFRESH_TOKEN_STORAGE } from '../../../auth/application/ports/refresh-token-storage';
import type { IRefreshTokenStorage } from '../../../auth/application/ports/refresh-token-storage';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';

import {
  AccountStatus,
  UserRole,
} from '../../../users/domain/enums/user.enums';

import { API_MESSAGES } from '../../../../common/constants/message.constants';

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  tokenType: 'refresh';
}

export interface RefreshAdminTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class RefreshAdminTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: IRefreshTokenStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshAdminTokenResult> {
    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.tokenService.verifyRefreshToken<RefreshTokenPayload>(
          refreshToken,
        );
    } catch {
      throw new UnauthorizedException(API_MESSAGES.ADMIN.SESSION_EXPIRED);
    }

    if (!payload.sub || !payload.jti || payload.tokenType !== 'refresh') {
      throw new UnauthorizedException(API_MESSAGES.ADMIN.INVALID_REFRESH_TOKEN);
    }

    const incomingHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedHash = await this.refreshTokenStorage.get(payload.jti);

    if (!storedHash || storedHash !== incomingHash) {
      throw new UnauthorizedException(API_MESSAGES.ADMIN.INVALID_REFRESH_TOKEN);
    }

    const admin = await this.userRepository.findById(payload.sub);

    if (
      !admin ||
      admin.role !== UserRole.ADMIN ||
      admin.accountStatus !== AccountStatus.ACTIVE
    ) {
      await this.refreshTokenStorage.delete(payload.jti);

      throw new UnauthorizedException(API_MESSAGES.ADMIN.SESSION_INVALID);
    }

    const newSessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.tokenService.getRefreshTokenTtl();

    const newRefreshToken = await this.tokenService.generateRefreshToken({
      sub: admin.id,
      jti: newSessionId,
      tokenType: 'refresh',
    });

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
      throw new UnauthorizedException(API_MESSAGES.ADMIN.SESSION_INVALID);
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.tokenService.getAccessTokenTtl(),
    };
  }
}
