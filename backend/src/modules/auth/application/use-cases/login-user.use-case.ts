import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { PASSWORD_HASHER } from '../ports/passwordhasher.js';
import type { PasswordHasher } from '../ports/passwordhasher.js';
import { LoginUserDto } from '../dto/login-user.dto.js';
import { UserRole } from '../../../users/domain/enums/user.enums.js';
import { AccountStatus } from '../../../users/domain/enums/user.enums.js';
import { API_MESSAGES } from '../../../../common/contstants/message.constants.js';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Please Verfy your email before logging in.');
    this.name = 'EmailNotVerfiedError';
  }
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserDto): Promise<UserEntity> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmailForAuthentication(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!passwordIsValid) {
      throw new InvalidCredentialsError();
    }
    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException('');
    }
    if (!user.emailVerified) {
      throw new EmailNotVerifiedError();
    }
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active.');
    }
    return user;
  }
}
