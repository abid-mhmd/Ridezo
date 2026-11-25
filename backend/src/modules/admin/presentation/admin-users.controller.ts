import {
  Controller,
  Inject,
  Get,
  Query,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { AdminUserListQueryDto } from '../application/dto/admin-user-list-query.dto';
import { AccountStatus } from '../../users/domain/enums/user.enums';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { AdminUserMapper } from './mappers/admin-user.mapper';
import type { AdminUserListItem } from './dto/admin-user-response.dto';
import {
  IListUsersUseCase,
  LIST_USERS_USE_CASE,
} from '../application/interfaces/list-users.use-case.interface';
import {
  GET_USER_DETAILS_USE_CASE,
  IGetUserDetailsUseCase,
} from '../application/interfaces/get-user-details.use-case.interface';
import {
  CHANGE_USER_ACCOUNT_STATUS_USE_CASE,
  IChangeUserAccountStatusUseCase,
} from '../application/interfaces/change-user-account-status.use-case.interface';
import { ReviewUserIdentityDto } from '../application/dto/review-user-identity.dto';
import { REVIEW_USER_IDENTITY_USE_CASE } from '../application/interfaces/review-user-identity.use-case.interface';
import { ReviewUserIdentityUseCase } from '../application/use-cases/review-user-identity.use-case';

@Controller(API_ENDPOINTS.ADMIN.USERS)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(
    @Inject(LIST_USERS_USE_CASE)
    private readonly listUsersUseCase: IListUsersUseCase,

    @Inject(GET_USER_DETAILS_USE_CASE)
    private readonly getUserDetailsUseCase: IGetUserDetailsUseCase,

    @Inject(CHANGE_USER_ACCOUNT_STATUS_USE_CASE)
    private readonly changeUserAccountStatusUseCase: IChangeUserAccountStatusUseCase,

    @Inject(REVIEW_USER_IDENTITY_USE_CASE)
    private readonly reviewUserIdentityUseCase: ReviewUserIdentityUseCase,
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

  @Patch(API_ENDPOINTS.ADMIN.REVIEW_USER_IDENTITY)
  async reviewUserIdentity(
    @Param('userId') userId: string,
    @Body() dto: ReviewUserIdentityDto,
  ) {
    const updatedUser = await this.reviewUserIdentityUseCase.execute(
      userId,
      dto,
    );

    return {
      success: true,
      message: API_MESSAGES.ADMIN.USER_IDENTITY_REVIEWED,
      data: AdminUserMapper.toDetailsResponse(updatedUser),
    };
  }
}
