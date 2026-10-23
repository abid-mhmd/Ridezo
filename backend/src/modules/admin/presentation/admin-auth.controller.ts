import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { AdminLoginDto } from '../application/dto/admin-login.dto.js';
import { AdminLoginUseCase } from '../application/use-cases/admin-login.use-case.js';
import { REFRESH_TOKEN_STORAGE } from '../../auth/application/ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../../auth/application/ports/refresh-token-storage.js';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,
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
    

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    response.cookie('ridezo_admin_refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin/auth',
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
}
