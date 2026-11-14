import {
  Body,
  ConflictException,
  BadRequestException,
  HttpException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EmailAlreadyRegisteredError } from '../application/use-cases/register-user.use-case';
import { RegisterUserDto } from '../application/dto/register-user.dto';
import { RequestEmailOtpDto } from '../application/dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from '../application/dto/verify-email-otp.dto';
import {
  InvalidEmailOtpError,
  TooManyOtpAttemptsError,
} from '../application/use-cases/verify-email-otp.use-case';
import {
  InvalidCredentialsError,
  EmailNotVerifiedError,
} from '../application/use-cases/login-user.use-case';
import { LoginUserDto } from '../application/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload, JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';
import { ForgotPasswordDto } from '../application/dto/forgot-password.dto';
import {
  InvalidPasswordResetOtpError,
  TooManyPasswordResetAttemptsError,
} from '../application/use-cases/verify-password-reset-otp.use-case';
import { ResetPasswordDto } from '../application/dto/reset-password.dto';
import { InvalidPasswordResetTokenError } from '../application/use-cases/reset-password.use-case';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { GoogleAccountLinkRequiredError } from '../application/use-cases/google-auth.use-case';
import type { GoogleProfile } from '../application/use-cases/google-auth.use-case';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import {
  CurrentUserResponseDto,
  ForgotPasswordResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from '../application/dto/auth-response.dto';
import { TOKEN_SERVICE } from '../application/ports/token.service';
import type { ITokenService } from '../application/ports/token.service';
import {
  IRegisterUserUseCase,
  REGISTER_USER_USE_CASE,
} from '../application/interfaces/register-user.use-case.interface';
import {
  ISendEmailOtpUseCase,
  SEND_EMAIL_OTP_USE_CASE,
} from '../application/interfaces/send-email-otp.use-case.interface';
import {
  IVerifyEmailOtpUseCase,
  VERIFY_EMAIL_OTP_USE_CASE,
} from '../application/interfaces/verify-email-otp.use-case.interface';
import {
  ILoginUserUseCase,
  LOGIN_USER_USE_CASE,
} from '../application/interfaces/login-user.use-case.interface';
import {
  GOOGLE_AUTH_USE_CASE,
  IGoogleAuthUseCase,
} from '../application/interfaces/google-auth.use-case.interface';
import {
  IRefreshAccessTokenUseCase,
  REFRESH_ACCESS_TOKEN_USE_CASE,
} from '../application/interfaces/refresh-access-token.use-case.interface';
import {
  ILogoutUserUseCase,
  LOGOUT_USER_USE_CASE,
} from '../application/interfaces/logout-user.use-case.interface';
import {
  IRequestPasswordResetOtpUseCase,
  REQUEST_PASSWORD_RESET_OTP_USE_CASE,
} from '../application/interfaces/request-password-reset-otp.use-case.interface';
import {
  IVerifyPasswordResetOtpUseCase,
  VERIFY_PASSWORD_RESET_OTP_USE_CASE,
} from '../application/interfaces/verify-password-reset-otp.use-case.interface';
import {
  IResetPasswordUseCase,
  RESET_PASSWORD_USE_CASE,
} from '../application/interfaces/reset-password.use-case.interface';

@Controller()
export class AuthController {
  constructor(
    @Inject(REGISTER_USER_USE_CASE)
    private readonly registerUserUseCase: IRegisterUserUseCase,

    @Inject(SEND_EMAIL_OTP_USE_CASE)
    private readonly sendEmailOtpUseCase: ISendEmailOtpUseCase,

    @Inject(VERIFY_EMAIL_OTP_USE_CASE)
    private readonly verifyEmailOtpUseCase: IVerifyEmailOtpUseCase,

    @Inject(LOGIN_USER_USE_CASE)
    private readonly loginUserUseCase: ILoginUserUseCase,

    @Inject(REQUEST_PASSWORD_RESET_OTP_USE_CASE)
    private readonly requestPasswordResetOtpUseCase: IRequestPasswordResetOtpUseCase,

    @Inject(VERIFY_PASSWORD_RESET_OTP_USE_CASE)
    private readonly verifyPasswordResetOtpUseCase: IVerifyPasswordResetOtpUseCase,

    @Inject(RESET_PASSWORD_USE_CASE)
    private readonly resetPasswordUseCase: IResetPasswordUseCase,

    @Inject(GOOGLE_AUTH_USE_CASE)
    private readonly googleAuthUseCase: IGoogleAuthUseCase,

    @Inject(REFRESH_ACCESS_TOKEN_USE_CASE)
    private readonly refreshAccessTokenUseCase: IRefreshAccessTokenUseCase,

    @Inject(LOGOUT_USER_USE_CASE)
    private readonly logoutUserUseCase: ILogoutUserUseCase,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,

    private readonly configService: ConfigService,
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
      const result = await this.loginUserUseCase.execute(input);

      response.cookie('ridezo_refresh', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: result.refreshTtl * 1000,
      });

      return {
        success: true,
        message: API_MESSAGES.AUTH.LOGIN_SUCCESS,
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
    const refreshToken = request.cookies?.ridezo_refresh;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      response.clearCookie('ridezo_refresh', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
      });

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
          expiresIn: this.tokenService.getAccessTokenTtl(),
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
    await this.requestPasswordResetOtpUseCase.execute(input.email);

    return {
      success: true,
      message: 'If an account exists, a password reset code will be sent.',
      data: {
        otpSent: true,
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

      response.cookie('ridezo_refresh', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: result.refreshTtl * 1000,
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
    const refreshToken = request.cookies?.ridezo_refresh;

    await this.logoutUserUseCase.execute(
      typeof refreshToken === 'string' ? refreshToken : undefined,
    );

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
