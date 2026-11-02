import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import type {
  CreateUserData,
  UserRepository,
} from '../../../users/domain/repositories/user.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import { PASSWORD_HASHER } from '../ports/passwordhasher.js';
import { PinoLogger } from 'nestjs-pino';
import type { RegisterUserDto } from '../dto/register-user.dto.js';
import type { PasswordHasher } from '../ports/passwordhasher.js';

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RegisterUserUseCase.name);
  }

  async execute(input: RegisterUserDto): Promise<UserEntity> {
    const email = input.email.trim().toLowerCase();
    const emailExists = await this.userRepository.existsByEmail(email);

    if (emailExists) {
      this.logger.warn('Registration failed: email already registered');
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const userData: CreateUserData = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
    };

    const user = await this.userRepository.create(userData);
    this.logger.info('User registered successfully');
    return user;
  }
}
