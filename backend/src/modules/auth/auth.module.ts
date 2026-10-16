import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../users/domain/repositories/user.repository.js';
import { UsersModule } from '../users/users.module.js';
import { PASSWORD_HASHER } from './application/ports/passwordhasher.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { Argon2PasswordHasher } from './infrastructure/pre/security/persistence/argon2-password-hasher.js';

import type { UserRepository } from '../users/domain/repositories/user.repository.js';
import type { PasswordHasher } from './application/ports/passwordhasher.js';
import { AuthController } from './presentation/auth.controller.js';
import { OTP_STORAGE } from './application/ports/otp-storage.js';
import { RedisOtpStorage } from './infrastructure/pre/security/persistence/redise.otp.storage.js';
import { RedisModule } from '../../infrastructure/redis/redis.module.js';
import { OtpGeneratorService } from './application/services/otp-generator.service.js';
import { SendEmailOtpUseCase } from './application/use-cases/send-email-otp.use.case.js';

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [AuthController],
  providers: [
    {
      provide: OTP_STORAGE,
      useClass: RedisOtpStorage,
    },
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
    OtpGeneratorService,
    SendEmailOtpUseCase,
  ],
  exports: [RegisterUserUseCase],
})
export class AuthModule {}
