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
import { Get, Req, UseGuards } from '@nestjs/common';
import { AccessTokenPayload, JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { Request } from 'express';
import { ForgotPasswordDto } from '../application/dto/forgot-password.dto.js';
import { RequestPasswordResetOtpUseCase } from '../application/use-cases/request-password-reset.use-case-otp.js';
import { VerifyPasswordResetOtpUseCase } from '../application/use-cases/verify-password-reset-otp.use-case.js';
import {
  InvalidPasswordResetOtpError,
  TooManyPasswordResetAttemptsError,
} from '../application/use-cases/verify-password-reset-otp.use-case.js';
import { error } from 'console';

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
  async login(@Body() input: LoginUserDto) {
    try {
      const user = await this.loginUserUseCase.execute(input);

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        message: 'Login successfull',
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
        throw new UnauthorizedException('Invalid email or password');
      }

      if (error instanceof EmailNotVerifiedError) {
        throw new ForbiddenException('Please verify email before loggin in.');
      }
    }
    throw error;
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
}
