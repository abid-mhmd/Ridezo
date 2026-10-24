import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { RedisModule } from '../../infrastructure/redis/redis.module.js';
import { AdminAuthController } from './presentation/admin-auth.controller.js';
import { AdminLoginUseCase } from './application/use-cases/admin-login.use-case.js';
import { REFRESH_TOKEN_STORAGE } from '../auth/application/ports/refresh-token-storage.js';
import { RedisRefreshTokenStorage } from '../auth/infrastructure/persistence/security/persistence/redis-refresh-token.storage.js';
import { AdminUsersController } from './presentation/admin-users.controller.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { AdminRoleGuard } from './presentation/guards/admin-role.guard.js';
import { GetUserDetailsUseCase } from './application/use-cases/get-user-detail.user-case.js';
import { ChangeUserAccountStatusUseCase } from './application/use-cases/change-user-account-status.use-case.js';

@Module({
  imports: [AuthModule, UsersModule, RedisModule, JwtModule.register({})],
  controllers: [AdminAuthController, AdminUsersController],
  providers: [
    AdminLoginUseCase,
    ListUsersUseCase,
    AdminRoleGuard,
    GetUserDetailsUseCase,
    ChangeUserAccountStatusUseCase,
    {
      provide: REFRESH_TOKEN_STORAGE,
      useClass: RedisRefreshTokenStorage,
    },
  ],
})
export class AdminAuthModule {}
