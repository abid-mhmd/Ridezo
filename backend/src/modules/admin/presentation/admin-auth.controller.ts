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
import { ConfigService } from '@nestjs/config';
import { AdminLoginDto } from './dto/admin-login.dto';
import { REFRESH_TOKEN_STORAGE } from '../../auth/application/ports/refresh-token-storage';
import type { IRefreshTokenStorage } from '../../auth/application/ports/refresh-token-storage';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import {
  ADMIN_LOGIN_USE_CASE,
  IAdminLoginUseCase,
} from '../application/interfaces/admin-login.use-case.interface';
import {
  ADMIN_LOGOUT_USE_CASE,
  IAdminLogoutUseCase,
} from '../application/interfaces/admin-logout.use-case.interface';
import {
  IRefreshAdminTokenUseCase,
  REFRESH_ADMIN_TOKEN_USE_CASE,
} from '../application/interfaces/refresh-admin-token.use-case.interface';

@Controller()
export class AdminAuthController {
  constructor(
    @Inject(ADMIN_LOGIN_USE_CASE)
    private readonly _adminLoginUseCase: IAdminLoginUseCase,

    @Inject(REFRESH_ADMIN_TOKEN_USE_CASE)
    private readonly _refreshAdminTokenUseCase: IRefreshAdminTokenUseCase,

    private readonly _configService: ConfigService,

    @Inject(ADMIN_LOGOUT_USE_CASE)
    private readonly _adminLogoutUseCase: IAdminLogoutUseCase,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly _refreshTokenStorage: IRefreshTokenStorage,
  ) {}

  @Post(API_ENDPOINTS.ADMIN.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this._adminLoginUseCase.execute(input);

    response.cookie('ridezo_admin_refresh', result.refreshToken, {
      httpOnly: true,
      secure: this._configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
      maxAge: result.refreshTtl * 1000,
    });

    return ApiResponseHelper.success(
      {
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
      API_MESSAGES.ADMIN.LOGIN_SUCCESS,
    );
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
        secure: this._configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/admin',
      });
    };

    if (!refreshToken || typeof refreshToken !== 'string') {
      clearAdminCookie();

      throw new UnauthorizedException(API_MESSAGES.ADMIN.SESSION_EXPIRED);
    }

    try {
      const result = await this._refreshAdminTokenUseCase.execute(refreshToken);

      response.cookie('ridezo_admin_refresh', result.refreshToken, {
        httpOnly: true,
        secure: this._configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/admin',
        maxAge: result.expiresIn * 1000,
      });

      return ApiResponseHelper.success(
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        API_MESSAGES.ADMIN.LOGIN_SUCCESS,
      );
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

    await this._adminLogoutUseCase.execute(
      typeof refreshToken === 'string' ? refreshToken : undefined,
    );

    response.clearCookie('ridezo_admin_refresh', {
      httpOnly: true,
      secure: this._configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/admin',
    });

    return ApiResponseHelper.success(null, API_MESSAGES.ADMIN.LOGOUT_SUCCESS);
  }
}
