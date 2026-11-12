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
import { ADMIN_LOGIN_USE_CASE } from './application/interfaces/admin-login.use-case.interface';
import { ADMIN_LOGOUT_USE_CASE } from './application/interfaces/admin-logout.use-case.interface';
import { REFRESH_ADMIN_TOKEN_USE_CASE } from './application/interfaces/refresh-admin-token.use-case.interface';
import { LIST_USERS_USE_CASE } from './application/interfaces/list-users.use-case.interface';
import { GET_USER_DETAILS_USE_CASE } from './application/interfaces/get-user-details.use-case.interface';
import { CHANGE_USER_ACCOUNT_STATUS_USE_CASE } from './application/interfaces/change-user-account-status.use-case.interface';

@Module({
  imports: [AuthModule, UsersModule, SecurityModule],
  controllers: [AdminAuthController, AdminUsersController],
  providers: [
    {
      provide: ADMIN_LOGIN_USE_CASE,
      useClass: AdminLoginUseCase,
    },
    {
      provide: REFRESH_ADMIN_TOKEN_USE_CASE,
      useClass: RefreshAdminTokenUseCase,
    },
    {
      provide: LIST_USERS_USE_CASE,
      useClass: ListUsersUseCase,
    },
    AdminRoleGuard,
    {
      provide: GET_USER_DETAILS_USE_CASE,
      useClass: GetUserDetailsUseCase,
    },
    {
      provide: CHANGE_USER_ACCOUNT_STATUS_USE_CASE,
      useClass: ChangeUserAccountStatusUseCase,
    },
    {
      provide: ADMIN_LOGOUT_USE_CASE,
      useClass: AdminLogoutUseCase,
    },
  ],
})
export class AdminAuthModule {}
