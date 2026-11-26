import {
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { AdminRideListQueryDto } from '../application/dto/admin-ride-query.dto';
import {
  LIST_ADMIN_RIDES_USE_CASE,
  type IListAdminRidesUseCase,
} from '../application/interfaces/list-admin-rides.use-case.interface';
import {
  GET_ADMIN_RIDE_DETAILS_USE_CASE,
  type IGetAdminRideDetailsUseCase,
} from '../application/interfaces/get-admin-ride-details.use-case.interface';
import {
  CANCEL_ADMIN_RIDE_USE_CASE,
  type CancelAdminRideResult,
  type ICancelAdminRideUseCase,
} from '../application/interfaces/cancel-admin-ride.use-case.interface';
import { AdminRideMapper } from './mappers/admin-ride.mapper';
import type {
  AdminRideDetailsDto,
  AdminRideListItemDto,
} from './dto/admin-ride-response.dto';

@Controller(API_ENDPOINTS.ADMIN.RIDES)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminRidesController {
  constructor(
    @Inject(LIST_ADMIN_RIDES_USE_CASE)
    private readonly _listAdminRidesUseCase: IListAdminRidesUseCase,

    @Inject(GET_ADMIN_RIDE_DETAILS_USE_CASE)
    private readonly _getAdminRideDetailsUseCase: IGetAdminRideDetailsUseCase,

    @Inject(CANCEL_ADMIN_RIDE_USE_CASE)
    private readonly _cancelAdminRideUseCase: ICancelAdminRideUseCase,
  ) {}

  @Get()
  async listRides(
    @Query() query: AdminRideListQueryDto,
  ): Promise<ApiResponse<AdminRideListItemDto[]>> {
    const result = await this._listAdminRidesUseCase.execute(query);
    const items = AdminRideMapper.toListResponse(result.rides);

    return ApiResponseHelper.paginated(
      items,
      result.pagination,
      API_MESSAGES.ADMIN.RIDES_RETRIEVED_SUCCESS,
    );
  }

  @Get(API_ENDPOINTS.ADMIN.RIDE_BY_ID)
  async getRideDetails(
    @Param('rideId') rideId: string,
  ): Promise<ApiResponse<AdminRideDetailsDto>> {
    const result = await this._getAdminRideDetailsUseCase.execute(rideId);
    const details = AdminRideMapper.toDetailsResponse(result);

    return ApiResponseHelper.success(
      details,
      API_MESSAGES.ADMIN.RIDE_RETRIEVED_SUCCESS,
    );
  }

  @Patch(API_ENDPOINTS.ADMIN.CANCEL_RIDE)
  async cancelRide(
    @Param('rideId') rideId: string,
  ): Promise<ApiResponse<CancelAdminRideResult>> {
    const result = await this._cancelAdminRideUseCase.execute(rideId);

    return ApiResponseHelper.success(
      result,
      API_MESSAGES.ADMIN.RIDE_CANCELLED_SUCCESS,
    );
  }
}
