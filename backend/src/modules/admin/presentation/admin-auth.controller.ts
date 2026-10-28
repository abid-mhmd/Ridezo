import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { AdminLoginDto } from '../application/dto/admin-login.dto.js';
import { AdminLoginUseCase } from '../application/use-cases/admin-login.use-case.js';
import { REFRESH_TOKEN_STORAGE } from '../../auth/application/ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../../auth/application/ports/refresh-token-storage.js';
import {
  AccountStatus,
  UserRole,
} from '../../users/domain/enums/user.enums.js';
import { USER_REPOSITORY } from '../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../users/domain/repositories/user.repository.js';

@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const admin = await this.adminLoginUseCase.execute(input);

    const sessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TTL_SECONDS',
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: 900,
      },
    );

    response.cookie('ridezo_admin_refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
      maxAge: refreshTtl * 1000,
    });

    return {
      message: 'Admin login successful.',
      accessToken,
      expiresIn: 900,
      user: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.ridezo_admin_refresh;

    const clearAdminCookie = () => {
      response.clearCookie('ridezo_admin_refresh', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/admin',
      });
    };

    if (!refreshToken || typeof refreshToken !== 'string') {
      clearAdminCookie();

      throw new UnauthorizedException(
        'Admin session expired. Please log in again.',
      );
    }

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    let payload: {
      sub: string;
      jti: string;
      tokenType: 'refresh';
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      clearAdminCookie();
      throw new UnauthorizedException(
        'Admin session expired. Please log in again.',
      );
    }

    if (!payload.sub || !payload.jti || payload.tokenType !== 'refresh') {
      clearAdminCookie();
      throw new UnauthorizedException('Invalid admin refresh token.');
    }

    const incomingHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedHash = await this.refreshTokenStorage.get(payload.jti);

    if (!storedHash || storedHash !== incomingHash) {
      clearAdminCookie();
      throw new UnauthorizedException('Invalid admin refresh token.');
    }

    const admin = await this.userRepository.findById(payload.sub);

    if (
      !admin ||
      admin.role !== UserRole.ADMIN ||
      admin.accountStatus !== AccountStatus.ACTIVE
    ) {
      await this.refreshTokenStorage.delete(payload.jti);
      clearAdminCookie();

      throw new UnauthorizedException('Admin session is no longer valid.');
    }

    const newSessionId = randomBytes(16).toString('hex');

    const refreshTtl = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TTL_SECONDS',
    );

    const newRefreshToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
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
      clearAdminCookie();
      throw new UnauthorizedException(
        'Admin session is invalid or already used.',
      );
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: 900,
      },
    );

    response.cookie('ridezo_admin_refresh', newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
      maxAge: refreshTtl * 1000,
    });

    return {
      accessToken,
      expiresIn: 900,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.ridezo_admin_refresh;

    if (typeof refreshToken === 'string' && refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          jti: string;
          tokenType: string;
        }>(refreshToken, {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });

        if (payload.jti && payload.tokenType === 'refresh') {
          const incomingHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');

          const storedHash = await this.refreshTokenStorage.get(payload.jti);

          if (storedHash === incomingHash) {
            await this.refreshTokenStorage.delete(payload.jti);
          }
        }
      } catch {
        // The refresh token is invalid or expired.
      }
    }

    response.clearCookie('ridezo_admin_refresh', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
    });

    return { message: 'Admin logged out successfully.' };
  }
}
