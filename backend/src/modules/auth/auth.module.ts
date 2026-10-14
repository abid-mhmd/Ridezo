import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../users/domain/repositories/user.repository.js';
import { UsersModule } from '../users/users.module.js';
import { PASSWORD_HASHER } from './application/ports/passwordhasher.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { Argon2PasswordHasher } from './infrastructure/pre/security/argon2-password-hasher.js';

import type { UserRepository } from '../users/domain/repositories/user.repository.js';
import type { PasswordHasher } from './application/ports/passwordhasher.js';
import { AuthController } from './presentation/auth.controller.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (
        userRepostory: UserRepository,
        passwordHasher: PasswordHasher,
      ) => new RegisterUserUseCase(userRepostory, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
  ],
  exports: [RegisterUserUseCase],
})
export class AuthModule {}
