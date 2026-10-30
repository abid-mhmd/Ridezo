import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Inject,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { AdminLoginUseCase } from '../application/use-cases/admin-login.use-case.js';
import { RefreshAdminTokenUseCase } from '../application/use-cases/refresh-admin-token.use-case.js';
import { REFRESH_TOKEN_STORAGE } from '../../auth/application/ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../../auth/application/ports/refresh-token-storage.js';
import { API_MESSAGES } from '../../../common/constants/message.constants.js';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants.js';
import { AdminLogoutUseCase } from '../application/use-cases/admin-logout.use-case.js';

@Controller()
export class AdminAuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly refreshAdminTokenUseCase: RefreshAdminTokenUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminLogoutUseCase: AdminLogoutUseCase,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,
  ) {}

  @Post(API_ENDPOINTS.ADMIN.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.adminLoginUseCase.execute(input);

    response.cookie('ridezo_admin_refresh', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
      maxAge: result.refreshTtl * 1000,
    });

    return {
      success: true,
      message: API_MESSAGES.ADMIN.LOGIN_SUCCESS,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
        },
      },
    };
  }

  @Post(API_ENDPOINTS.ADMIN.REFRESH)
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

      throw new UnauthorizedException(API_MESSAGES.ADMIN.SESSION_EXPIRED);
    }

    try {
      const result = await this.refreshAdminTokenUseCase.execute(refreshToken);

      response.cookie('ridezo_admin_refresh', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/admin',
        maxAge: result.expiresIn * 1000,
      });

      return {
        success: true,
        message: API_MESSAGES.ADMIN.LOGIN_SUCCESS,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      };
    } catch (error) {
      clearAdminCookie();
      throw error;
    }
  }

  @Post(API_ENDPOINTS.ADMIN.LOGOUT)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.ridezo_admin_refresh;

    await this.adminLogoutUseCase.execute(
      typeof refreshToken === 'string' ? refreshToken : undefined,
    );

    response.clearCookie('ridezo_admin_refresh', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
    });

    return {
      success: true,
      message: API_MESSAGES.ADMIN.LOGOUT_SUCCESS,
    };
  }
}
