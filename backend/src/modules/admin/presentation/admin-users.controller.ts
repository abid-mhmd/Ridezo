import {
  Controller,
  Get,
  Query,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import { AdminRoleGuard } from './guards/admin-role.guard.js';
import { AdminUserListQueryDto } from '../application/dto/admin-user-list-query.dto.js';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case.js';
import { GetUserDetailsUseCase } from '../application/use-cases/get-user-detail.user-case.js';
import { ChangeUserAccountStatusUseCase } from '../application/use-cases/change-user-account-status.use-case.js';
import { AccountStatus } from '../../users/domain/enums/user.enums.js';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants.js';
import { API_MESSAGES } from '../../../common/constants/message.constants.js';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface.js';
import { AdminUserMapper } from './mappers/admin-user.mapper.js';
import type { AdminUserListItem } from './dto/admin-user-response.dto.js';

@Controller(API_ENDPOINTS.ADMIN.USERS)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserDetailsUseCase: GetUserDetailsUseCase,
    private readonly changeUserAccountStatusUseCase: ChangeUserAccountStatusUseCase,
  ) {}

  @Get()
  async listUsers(
    @Query() query: AdminUserListQueryDto,
  ): Promise<ApiResponse<AdminUserListItem[]>> {
    const result = await this.listUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return {
      success: true,
      message: API_MESSAGES.ADMIN.USER_RETRIEVED_SUCCESS,
      data: AdminUserMapper.toListResponse(result.users),
      meta: result.pagination,
    };
  }

  @Get(API_ENDPOINTS.ADMIN.USER_BY_ID)
  async getUserDetails(@Param('userId') userId: string) {
    const user = await this.getUserDetailsUseCase.execute(userId);

    return {
      success: true,
      message: API_MESSAGES.ADMIN.USER_RETRIEVED_SUCCESS,
      data: AdminUserMapper.toDetailsResponse(user),
    };
  }

  @Patch(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS)
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: AccountStatus },
  ) {
    const result = await this.changeUserAccountStatusUseCase.execute(
      userId,
      body.status,
    );

    return {
      success: true,
      message: API_MESSAGES.ADMIN.USER_ACCOUNT_STATUS,
      data: result,
    };
  }
}
