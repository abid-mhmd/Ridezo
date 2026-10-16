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

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,

    @Inject(SendEmailOtpUseCase)
    private readonly sendEmailOtpUseCase: SendEmailOtpUseCase,

    @Inject(VerifyEmailOtpUseCase)
    private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,
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
}
