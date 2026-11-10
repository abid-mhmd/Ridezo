import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PASSWORD_HASHER } from './application/ports/passwordhasher';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { Argon2PasswordHasher } from './infrastructure/persistence/security/persistence/argon2-password-hasher';
import { REFRESH_TOKEN_STORAGE } from './application/ports/refresh-token-storage';
import { RedisRefreshTokenStorage } from './infrastructure/persistence/security/persistence/redis-refresh-token.storage';
import { AuthController } from './presentation/auth.controller';
import { OTP_STORAGE } from './application/ports/otp-storage';
import { RedisOtpStorage } from './infrastructure/persistence/security/persistence/redise.otp.storage';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { OtpGeneratorService } from './application/services/otp-generator.service';
import { SendEmailOtpUseCase } from './application/use-cases/send-email-otp.use.case';
import { EMAIL_SENDER } from './application/ports/email.sender';
import { NodemailerEmailSender } from './infrastructure/email/nodemailer-email-sender';
import { OtpHasherService } from './application/services/otp-hasher.service';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RequestPasswordResetOtpUseCase } from './application/use-cases/request-password-reset.use-case-otp';
import { PASSWORD_RESET_STORAGE } from './application/ports/password-reset-storage';
import { RedisPasswordResetStorage } from './infrastructure/persistence/security/persistence/redis.password-reset.storage';
import { VerifyPasswordResetOtpUseCase } from './application/use-cases/verify-password-reset-otp.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../../infrastructure/redis/security/google.strategy';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { RefreshAccessTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    SecurityModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: OTP_STORAGE,
      useClass: RedisOtpStorage,
    },
    {
      provide: REFRESH_TOKEN_STORAGE,
      useClass: RedisRefreshTokenStorage,
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
      provide: PASSWORD_RESET_STORAGE,
      useClass: RedisPasswordResetStorage,
    },
    RegisterUserUseCase,
    OtpGeneratorService,
    SendEmailOtpUseCase,
    OtpHasherService,
    VerifyEmailOtpUseCase,
    LoginUserUseCase,
    RequestPasswordResetOtpUseCase,
    VerifyPasswordResetOtpUseCase,
    ResetPasswordUseCase,
    GoogleStrategy,
    GoogleAuthUseCase,
    RefreshAccessTokenUseCase,
    LogoutUserUseCase,
  ],
  exports: [RegisterUserUseCase, PASSWORD_HASHER, REFRESH_TOKEN_STORAGE],
})
export class AuthModule {}
