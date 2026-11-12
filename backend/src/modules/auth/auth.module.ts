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
import { REGISTER_USER_USE_CASE } from './application/interfaces/register-user.use-case.interface';
import { SEND_EMAIL_OTP_USE_CASE } from './application/interfaces/send-email-otp.use-case.interface';
import { VERIFY_EMAIL_OTP_USE_CASE } from './application/interfaces/verify-email-otp.use-case.interface';
import { LOGIN_USER_USE_CASE } from './application/interfaces/login-user.use-case.interface';
import { GOOGLE_AUTH_USE_CASE } from './application/interfaces/google-auth.use-case.interface';
import { REFRESH_ACCESS_TOKEN_USE_CASE } from './application/interfaces/refresh-access-token.use-case.interface';
import { LOGOUT_USER_USE_CASE } from './application/interfaces/logout-user.use-case.interface';
import { REQUEST_PASSWORD_RESET_OTP_USE_CASE } from './application/interfaces/request-password-reset-otp.use-case.interface';
import { VERIFY_PASSWORD_RESET_OTP_USE_CASE } from './application/interfaces/verify-password-reset-otp.use-case.interface';
import { RESET_PASSWORD_USE_CASE } from './application/interfaces/reset-password.use-case.interface';

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
    {
      provide: REGISTER_USER_USE_CASE,
      useClass: RegisterUserUseCase,
    },
    {
      provide: SEND_EMAIL_OTP_USE_CASE,
      useClass: SendEmailOtpUseCase,
    },
    OtpGeneratorService,
    OtpHasherService,
    {
      provide: VERIFY_EMAIL_OTP_USE_CASE,
      useClass: VerifyEmailOtpUseCase,
    },
    {
      provide: LOGIN_USER_USE_CASE,
      useClass: LoginUserUseCase,
    },
    {
      provide: REQUEST_PASSWORD_RESET_OTP_USE_CASE,
      useClass: RequestPasswordResetOtpUseCase,
    },
    {
      provide: VERIFY_PASSWORD_RESET_OTP_USE_CASE,
      useClass: VerifyPasswordResetOtpUseCase,
    },
    {
      provide: RESET_PASSWORD_USE_CASE,
      useClass: ResetPasswordUseCase,
    },
    GoogleStrategy,
    {
      provide: GOOGLE_AUTH_USE_CASE,
      useClass: GoogleAuthUseCase,
    },
    {
      provide: REFRESH_ACCESS_TOKEN_USE_CASE,
      useClass: RefreshAccessTokenUseCase,
    },
    {
      provide: LOGOUT_USER_USE_CASE,
      useClass: LogoutUserUseCase,
    },
  ],
  exports: [REGISTER_USER_USE_CASE, PASSWORD_HASHER, REFRESH_TOKEN_STORAGE],
})
export class AuthModule {}
