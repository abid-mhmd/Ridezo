import {
  Body,
  ConflictException,
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
import type { RegisterUserDto } from '../application/dto/register-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
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
}
