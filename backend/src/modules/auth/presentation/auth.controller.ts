import {
  Body,
  ConflictException,
  BadRequestException,
  HttpException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  EmailAlreadyRegisteredError,
  RegisterUserUseCase,
} from '../application/use-cases/register-user.use-case.js';
import { RegisterUserDto } from '../application/dto/register-user.dto.js';
import { RequestEmailOtpDto } from '../application/dto/request-email-otp.dto.js';
import { SendEmailOtpUseCase } from '../application/use-cases/send-email-otp.use.case.js';
import { VerifyEmailOtpDto } from '../application/dto/verify-email-otp.dto.js';
import {
  InvalidEmailOtpError,
  TooManyOtpAttemptsError,
  VerifyEmailOtpUseCase,
} from '../application/use-cases/verify-email-otp.use-case.js';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import {
  InvalidCredentialsError,
  EmailNotVerifiedError,
  LoginUserUseCase,
} from '../application/use-cases/login-user.use-case.js';
import { LoginUserDto } from '../application/dto/login-user.dto.js';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_STORAGE } from '../application/ports/refresh-token-storage.js';
import type { RefreshTokenStorage } from '../application/ports/refresh-token-storage.js';
import { ConfigService } from '@nestjs/config';
import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AccessTokenPayload, JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshAccessTokenUseCase } from '../application/use-cases/refresh-token.use-case.js';
import type { Request } from 'express';
import { ForgotPasswordDto } from '../application/dto/forgot-password.dto.js';
import { RequestPasswordResetOtpUseCase } from '../application/use-cases/request-password-reset.use-case-otp.js';
import { VerifyPasswordResetOtpUseCase } from '../application/use-cases/verify-password-reset-otp.use-case.js';
import {
  InvalidPasswordResetOtpError,
  TooManyPasswordResetAttemptsError,
} from '../application/use-cases/verify-password-reset-otp.use-case.js';
import { ResetPasswordDto } from '../application/dto/reset-password.dto.js';
import {
  ResetPasswordUseCase,
  InvalidPasswordResetTokenError,
} from '../application/use-cases/reset-password.use-case.js';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import {
  GoogleAuthUseCase,
  GoogleAccountLinkRequiredError,
} from '../application/use-cases/google-auth.use-case.js';
import type { GoogleProfile } from '../application/use-cases/google-auth.use-case.js';
import { API_MESSAGES } from '../../../common/constants/message.constants.js';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants.js';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface.js';
import {
  CurrentUserResponseDto,
  ForgotPasswordResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from '../application/dto/auth-response.dto.js';

@Controller()
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,

    @Inject(SendEmailOtpUseCase)
    private readonly sendEmailOtpUseCase: SendEmailOtpUseCase,

    @Inject(VerifyEmailOtpUseCase)
    private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,

    @Inject(LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @Inject(RequestPasswordResetOtpUseCase)
    private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,

    @Inject(VerifyPasswordResetOtpUseCase)
    private readonly verifyPasswordResetOtpUseCase: VerifyPasswordResetOtpUseCase,

    @Inject(ResetPasswordUseCase)
    private readonly resetPasswordUseCase: ResetPasswordUseCase,

    @Inject(GoogleAuthUseCase)
    private readonly googleAuthUseCase: GoogleAuthUseCase,

    @Inject(REFRESH_TOKEN_STORAGE)
    private readonly refreshTokenStorage: RefreshTokenStorage,

    @Inject(RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,

    private readonly configService: ConfigService,

    private readonly jwtService: JwtService,
  ) {}

  @Post(API_ENDPOINTS.AUTH.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() input: RegisterUserDto,
  ): Promise<ApiResponse<RegisterResponseDto>> {
    try {
      const user = await this.registerUserUseCase.execute(input);

      return {
        success: true,
        message: API_MESSAGES.AUTH.REGISTRATION_SUCCESS,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        },
      };
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Post(API_ENDPOINTS.AUTH.EMAIL_OTP)
  @HttpCode(HttpStatus.OK)
  async requestEmailOtp(@Body() input: RequestEmailOtpDto) {
    await this.sendEmailOtpUseCase.execute(input.email);

    return {
      success: true,
      message: API_MESSAGES.USERS.OTP_SENT,
    };
  }

  @Post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP)
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() input: VerifyEmailOtpDto) {
    try {
      await this.verifyEmailOtpUseCase.execute(input.email, input.otp);

      return {
        success: true,
        message: API_MESSAGES.AUTH.EMAIL_VERIFIED,
      };
    } catch (error) {
      if (error instanceof TooManyOtpAttemptsError) {
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }

      if (error instanceof InvalidEmailOtpError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Post(API_ENDPOINTS.AUTH.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const user = await this.loginUserUseCase.execute(input);

      const sessionId = randomBytes(16).toString('hex');

      const refreshTtl = this.configService.getOrThrow<number>(
        'JWT_REFRESH_TTL_SECONDS',
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
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
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      response.cookie('ridezo_refresh', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: refreshTtl * 1000,
      });

      return {
        success: true,
        message: API_MESSAGES.AUTH.LOGIN_SUCCESS,
        data: {
          accessToken,
          expiresIn: 900,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      if (error instanceof EmailNotVerifiedError) {
        throw new ForbiddenException(
          'Please verify your email before logging in.',
        );
      }

      throw error;
    }
  }

  @Post(API_ENDPOINTS.AUTH.REFRESH)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<RefreshResponseDto>> {
    const refreshToken = request.cookies?.ridezo_refresh as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    try {
      const result = await this.refreshAccessTokenUseCase.execute(refreshToken);

      const refreshTtl = this.configService.getOrThrow<number>(
        'JWT_REFRESH_TTL_SECONDS',
      );

      response.cookie('ridezo_refresh', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: refreshTtl * 1000,
      });

      return {
        success: true,
        message: API_MESSAGES.AUTH.REFRESH_SUCCESS,
        data: {
          accessToken: result.accessToken,
          expiresIn: 900,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        response.clearCookie('ridezo_refresh', {
          httpOnly: true,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          sameSite: 'lax',
          path: '/api/auth',
        });
      }

      throw error;
    }
  }

  @Get(API_ENDPOINTS.USERS.ME)
  @UseGuards(JwtAuthGuard)
  getCurrentUser(
    @Req() request: Request & { user?: AccessTokenPayload },
  ): ApiResponse<CurrentUserResponseDto> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    return {
      success: true,
      message: API_MESSAGES.USERS.USER_RETRIEVED_SUCCESS,
      data: {
        user: {
          id: user.sub,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  @Post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() input: ForgotPasswordDto,
  ): Promise<ApiResponse<ForgotPasswordResponseDto>> {
    const otpSent = await this.requestPasswordResetOtpUseCase.execute(
      input.email,
    );

    return {
      success: true,
      message: otpSent
        ? 'OTP sent successfully.'
        : 'Unable to process this email. Please check your email address and try again.',
      data: {
        otpSent,
      },
    };
  }

  @Post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP)
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(@Body() input: VerifyEmailOtpDto) {
    try {
      const result = await this.verifyPasswordResetOtpUseCase.execute(
        input.email,
        input.otp,
      );

      return {
        success: true,
        message: API_MESSAGES.AUTH.PASSWORD_RESET_OTP_SUCCESS,
        data: result,
      };
    } catch (error) {
      if (
        error instanceof InvalidPasswordResetOtpError ||
        error instanceof TooManyPasswordResetAttemptsError
      ) {
        throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_OTP);
      }
      throw error;
    }
  }

  @Post(API_ENDPOINTS.AUTH.RESET_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() input: ResetPasswordDto): Promise<ApiResponse> {
    try {
      await this.resetPasswordUseCase.execute(
        input.resetToken,
        input.newPassword,
      );

      return {
        success: true,
        message: API_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
      };
    } catch (error) {
      if (error instanceof InvalidPasswordResetTokenError) {
        throw new BadRequestException(API_MESSAGES.AUTH.SESSION_EXPIRED);
      }
      throw error;
    }
  }

  @Get(API_ENDPOINTS.AUTH.GOOGLE)
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {
    // Passport redirects the user to Google.
  }

  @Get(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK)
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req()
    request: Request & {
      user?: GoogleProfile;
    },
    @Res()
    response: Response,
  ) {
    const profile = request.user;

    if (!profile) {
      throw new UnauthorizedException('Google authentication failed.');
    }

    try {
      const result = await this.googleAuthUseCase.execute(profile);

      const sessionId = randomBytes(16).toString('hex');

      const refreshTtl = this.configService.getOrThrow<number>(
        'JWT_REFRESH_TTL_SECONDS',
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          sub: result.user.id,
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

      response.cookie('ridezo_refresh', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: refreshTtl * 1000,
      });

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

      return response.redirect(`${frontendUrl}/auth/google/callback`);
    } catch (error) {
      if (error instanceof GoogleAccountLinkRequiredError) {
        return response.redirect(
          `${this.configService.getOrThrow<string>('FRONTEND_URL')}/login?error=google-account-link-required`,
        );
      }

      throw error;
    }
  }

  @Post(API_ENDPOINTS.AUTH.LOGOUT)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse> {
    const refreshToken = request.cookies?.ridezo_refresh as string | undefined;

    if (refreshToken) {
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
        // An invalid or expired refresh token cannot be used to restore a session.
      }
    }

    response.clearCookie('ridezo_refresh', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    });

    return {
      success: true,
      message: API_MESSAGES.AUTH.LOGOUT_SUCCESS,
    };
  }
}
