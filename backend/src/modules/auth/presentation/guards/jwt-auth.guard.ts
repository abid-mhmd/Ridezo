import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { AccountStatus } from '../../../users/domain/enums/user.enums.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & {
  user?: AccessTokenPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required.');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Access token is required.');
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Your account is suspended or inactive. Please log in again or contact support.',
      );
    }

    request.user = {
      ...payload,
      role: user.role,
    };

    return true;
  }
}
