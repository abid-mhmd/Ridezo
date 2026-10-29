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
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';

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

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const passwordIsValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (
      !passwordIsValid ||
      user.role !== UserRole.ADMIN ||
      !user.emailVerified ||
      user.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new UnauthorizedException(API_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    return user;
  }
}
