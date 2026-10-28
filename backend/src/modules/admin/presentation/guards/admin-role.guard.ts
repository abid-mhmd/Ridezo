import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '../../../users/domain/enums/user.enums.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
