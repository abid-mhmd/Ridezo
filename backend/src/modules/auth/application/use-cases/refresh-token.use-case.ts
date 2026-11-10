import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ITokenService } from '../ports/token.service';
import { TOKEN_SERVICE } from '../ports/token.service';
import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_STORAGE } from '../ports/refresh-token-storage';
import type { IRefreshTokenStorage } from '../ports/refresh-token-storage';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { AccountStatus } from '../../../users/domain/enums/user.enums';
import { API_MESSAGES } from '../../../../common/constants/message.constants';

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  tokenType: 'refresh';
}

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: IRefreshTokenStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.tokenService.verifyRefreshToken<RefreshTokenPayload>(
          refreshToken,
        );
    } catch {
      throw new UnauthorizedException(API_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
    }
    if (!payload.sub || !payload.jti || payload.tokenType !== 'refresh') {
      throw new UnauthorizedException(API_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
    }

    const incomingHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedHash = await this.refreshTokenStorage.get(payload.jti);

    if (!storedHash || storedHash !== incomingHash) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      await this.refreshTokenStorage.delete(payload.jti);

      throw new UnauthorizedException(API_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
    }
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      await this.refreshTokenStorage.delete(payload.jti);

      throw new UnauthorizedException(
        'Your account is suspended or inactive. Please contact support.',
      );
    }

    const newSessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.tokenService.getRefreshTokenTtl();

    const newRefreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
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
      throw new UnauthorizedException(API_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
    }

    const accessToken = await this.tokenService.generateAccessToken({
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
