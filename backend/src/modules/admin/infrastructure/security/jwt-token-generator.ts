import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { TokenGenerator } from '../../application/ports/token.generator.js';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateRefreshToken(payload: {
    sub: string;
    jti: string;
    tokenType: 'refresh';
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<number>(
        'JWT_REFRESH_TTL_SECONDS',
      ),
    });
  }

  async generateAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: 900,
    });
  }
}
