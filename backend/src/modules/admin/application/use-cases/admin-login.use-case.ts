import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { PasswordHasher } from '../../../auth/application/ports/passwordhasher.js';
import { PASSWORD_HASHER } from '../../../auth/application/ports/passwordhasher.js';
import { AdminLoginDto } from '../dto/admin-login.dto.js';
import {
  AccountStatus,
  UserRole,
} from '../../../users/domain/enums/user.enums.js';

export class InvalidAdminCredetialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidAdminCredetialsError';
  }
}

@Injectable()
export class AdminLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AdminLoginDto) {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmailForAuthentication(email);

    if (!user) {
      throw new InvalidAdminCredetialsError();
    }
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}
