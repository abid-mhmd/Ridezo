import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { AdminAuthController } from './presentation/admin-auth.controller';
import { AdminLoginUseCase } from './application/use-cases/admin-login.use-case';
import { AdminUsersController } from './presentation/admin-users.controller';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { AdminRoleGuard } from './presentation/guards/admin-role.guard';
import { GetUserDetailsUseCase } from './application/use-cases/get-user-detail.user-case';
import { ChangeUserAccountStatusUseCase } from './application/use-cases/change-user-account-status.use-case';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';
import { AdminLogoutUseCase } from './application/use-cases/admin-logout.use-case';

@Module({
  imports: [AuthModule, UsersModule, SecurityModule],
  controllers: [AdminAuthController, AdminUsersController],
  providers: [
    AdminLoginUseCase,
    RefreshAdminTokenUseCase,
    ListUsersUseCase,
    AdminRoleGuard,
    GetUserDetailsUseCase,
    ChangeUserAccountStatusUseCase,
    AdminLogoutUseCase,
  ],
})
export class AdminAuthModule {}
