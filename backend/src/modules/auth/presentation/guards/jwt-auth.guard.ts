import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & { user?: AccessTokenPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.get('Authorization');

    if (!authorization?.startsWith('Bearer')) {
      throw new UnauthorizedException('Access token i required.');
    }

    const token = authorization.slice('Beared'.length).trim();

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.role !== 'string'
      ) {
        throw new UnauthorizedException('Invalid access token.');
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access to token.');
    }
  }
}
