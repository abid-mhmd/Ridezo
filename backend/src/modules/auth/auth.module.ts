import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../users/domain/repositories/user.repository.js';
import { UsersModule } from '../users/users.module.js';
import { PASSWORD_HASHER } from './application/ports/passwordhasher.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { Argon2PasswordHasher } from './infrastructure/persistence/security/persistence/argon2-password-hasher.js';

import type { UserRepository } from '../users/domain/repositories/user.repository.js';
import type { PasswordHasher } from './application/ports/passwordhasher.js';
import { AuthController } from './presentation/auth.controller.js';
import { OTP_STORAGE } from './application/ports/otp-storage.js';
import { RedisOtpStorage } from './infrastructure/persistence/security/persistence/redise.otp.storage.js';
import { RedisModule } from '../../infrastructure/redis/redis.module.js';
import { OtpGeneratorService } from './application/services/otp-generator.service.js';
import { SendEmailOtpUseCase } from './application/use-cases/send-email-otp.use.case.js';
import { EMAIL_SENDER } from './application/ports/email.sender.js';
import { NodemailerEmailSender } from './infrastructure/email/nodemailer-email-sender.js';
import { OtpHasherService } from './application/services/otp-hasher.service.js';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case.js';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { number } from 'joi';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
            '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
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
      provide: EMAIL_SENDER,
      useClass: NodemailerEmailSender,
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
    OtpHasherService,
    VerifyEmailOtpUseCase,
    LoginUserUseCase,
  ],
  exports: [RegisterUserUseCase],
})
export class AuthModule {}
