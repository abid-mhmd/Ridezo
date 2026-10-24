import { Controller, Get, Query,Body, Param,Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import { AdminRoleGuard } from './guards/admin-role.guard.js';
import { AdminUserListQueryDto } from '../application/dto/admin-user-list-query.dto.js';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case.js';
import { GetUserDetailsUseCase } from '../application/use-cases/get-user-detail.user-case.js';
import { ChangeUserAccountStatusUseCase } from '../application/use-cases/change-user-account-status.use-case.js';
import { AccountStatus } from '../../users/domain/enums/user.enums.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserDetailsUseCase: GetUserDetailsUseCase,
    private readonly changeUserAccountStatusUseCase:ChangeUserAccountStatusUseCase,
  ) {}

  @Get()
  async listUsers(@Query() query: AdminUserListQueryDto) {
    return this.listUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get(':userId')
  async getUserDetails(@Param('userId') userId: string) {
    const user = await this.getUserDetailsUseCase.execute(userId);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        about: user.about,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        idVerified: user.identityVerification.status,
        languages: user.languages,
        location: user.location,
        completedRideCount: user.completedRideCount,
        rating: user.rating,
        reviewCount: user.reviewCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Patch(':userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: AccountStatus },
  ) {
    return this.changeUserAccountStatusUseCase.execute(userId, body.status);
  }
}
