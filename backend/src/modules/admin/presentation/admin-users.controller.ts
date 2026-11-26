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
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
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
import {
  IReviewUserIdentityUseCase,
  REVIEW_USER_IDENTITY_USE_CASE,
} from '../application/interfaces/review-user-identity.use-case.interface';

@Controller(API_ENDPOINTS.ADMIN.USERS)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(
    @Inject(LIST_USERS_USE_CASE)
    private readonly _listUsersUseCase: IListUsersUseCase,

    @Inject(GET_USER_DETAILS_USE_CASE)
    private readonly _getUserDetailsUseCase: IGetUserDetailsUseCase,

    @Inject(CHANGE_USER_ACCOUNT_STATUS_USE_CASE)
    private readonly _changeUserAccountStatusUseCase: IChangeUserAccountStatusUseCase,

    @Inject(REVIEW_USER_IDENTITY_USE_CASE)
    private readonly _reviewUserIdentityUseCase: IReviewUserIdentityUseCase,
  ) {}

  @Get()
  async listUsers(
    @Query() query: AdminUserListQueryDto,
  ): Promise<ApiResponse<AdminUserListItem[]>> {
    const result = await this._listUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return ApiResponseHelper.paginated(
      AdminUserMapper.toListResponse(result.users),
      result.pagination,
      API_MESSAGES.ADMIN.USER_RETRIEVED_SUCCESS,
    );
  }

  @Get(API_ENDPOINTS.ADMIN.USER_BY_ID)
  async getUserDetails(@Param('userId') userId: string) {
    const user = await this._getUserDetailsUseCase.execute(userId);

    return ApiResponseHelper.success(
      AdminUserMapper.toDetailsResponse(user),
      API_MESSAGES.ADMIN.USER_RETRIEVED_SUCCESS,
    );
  }

  @Patch(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS)
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: AccountStatus },
  ) {
    const result = await this._changeUserAccountStatusUseCase.execute(
      userId,
      body.status,
    );

    return ApiResponseHelper.success(
      result,
      API_MESSAGES.ADMIN.USER_ACCOUNT_STATUS,
    );
  }

  @Patch(API_ENDPOINTS.ADMIN.REVIEW_USER_IDENTITY)
  async reviewUserIdentity(
    @Param('userId') userId: string,
    @Body() dto: ReviewUserIdentityDto,
  ) {
    const updatedUser = await this._reviewUserIdentityUseCase.execute(
      userId,
      dto,
    );

    return ApiResponseHelper.success(
      AdminUserMapper.toDetailsResponse(updatedUser),
      API_MESSAGES.ADMIN.USER_IDENTITY_REVIEWED,
    );
  }
}
