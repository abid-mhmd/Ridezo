import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import type { ITokenService } from '../../modules/auth/application/ports/token.service.js';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(payload: {
    sub: string;
    jti: string;
    tokenType: 'refresh';
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshTokenTtl(),
    });
  }

  async verifyAccessToken<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  getRefreshTokenTtl(): number {
    return this.configService.getOrThrow<number>('JWT_REFRESH_TTL_SECONDS');
  }
}
