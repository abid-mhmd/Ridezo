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
import { error } from 'console';
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

@Controller('auth')
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() input: RegisterUserDto) {
    try {
      const user = await this.registerUserUseCase.execute(input);

      return {
        message: 'Registration successful.',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Post('email-otp')
  @HttpCode(HttpStatus.OK)
  async requestEmailOtp(@Body() input: RequestEmailOtpDto) {
    await this.sendEmailOtpUseCase.execute(input.email);

    return {
      message: `If the request is eligible, a verfication code will be sent.`,
    };
  }

  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() input: VerifyEmailOtpDto) {
    try {
      await this.verifyEmailOtpUseCase.execute(input.email, input.otp);

      return {
        message: 'Email verified successfully.',
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
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
        message: 'Login successful.',
        accessToken,
        expiresIn: 900,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      if (error instanceof EmailNotVerifiedError) {
        throw new ForbiddenException(
          'Please verify your email before logging in.',
        );
      }

      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
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
        accessToken: result.accessToken,
        expiresIn: 900,
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() request: Request & { user?: AccessTokenPayload }) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authetication required.');
    }

    return {
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() input: ForgotPasswordDto) {
    await this.requestPasswordResetOtpUseCase.execute(input.email);

    return {
      message:
        'If an account exists with this email, a password-reset OTP has been sent.',
    };
  }

  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(@Body() input: VerifyEmailOtpDto) {
    try {
      return await this.verifyPasswordResetOtpUseCase.execute(
        input.email,
        input.otp,
      );
    } catch (error) {
      if (
        error instanceof InvalidPasswordResetOtpError ||
        error instanceof TooManyPasswordResetAttemptsError
      ) {
        throw new UnauthorizedException(
          'Invalid or expired password-reset OTP.',
        );
      }
      throw error;
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() input: ResetPasswordDto) {
    try {
      await this.resetPasswordUseCase.execute(
        input.resetToken,
        input.newPassword,
      );

      return {
        message: 'Password reset successful. Please login again.',
      };
    } catch (error) {
      if (error instanceof InvalidPasswordResetTokenError) {
        throw new BadRequestException(
          'Invalid or expired password-reset authorization.',
        );
      }
    }
    throw error;
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {
    // Passport redirects the user to Google.
  }

  @Get('google/callback')
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

      return response.status(HttpStatus.OK).json({
        message: 'Google authentication successful.',
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
        },
      });
    } catch (error) {
      if (error instanceof GoogleAccountLinkRequiredError) {
        return response.status(HttpStatus.CONFLICT).json({
          message:
            'An account with this email already exists. Please log in using your existing method.',
        });
      }

      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
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

    return { message: 'Logged out successfully.' };
  }
}
