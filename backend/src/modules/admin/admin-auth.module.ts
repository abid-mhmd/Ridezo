import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { RedisModule } from '../../infrastructure/redis/redis.module.js';
import { AdminAuthController } from './presentation/admin-auth.controller.js';
import { AdminLoginUseCase } from './application/use-cases/admin-login.use-case.js';
import { REFRESH_TOKEN_STORAGE } from '../auth/application/ports/refresh-token-storage.js';
import { RedisRefreshTokenStorage } from '../auth/infrastructure/persistence/security/persistence/redis-refresh-token.storage.js';

@Module({
  imports: [AuthModule, UsersModule, RedisModule, JwtModule.register({})],
  controllers: [AdminAuthController],
  providers: [
    AdminLoginUseCase,
    {
      provide: REFRESH_TOKEN_STORAGE,
      useClass: RedisRefreshTokenStorage,
    },
  ],
})
export class AdminAuthModule {}
