import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case.js';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() request: Request & { user?: AccessTokenPayload }) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return {
      user: await this.getUserProfileUseCase.execute(user.sub),
    };
  }
}
