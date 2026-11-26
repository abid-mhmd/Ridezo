import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { AdminBookingListQueryDto } from '../application/dto/admin-booking-query.dto';
import {
  LIST_ADMIN_BOOKINGS_USE_CASE,
  type IListAdminBookingsUseCase,
} from '../application/interfaces/list-admin-booking.use-case.interface';
import { AdminBookingMapper } from './mappers/admin-booking-mapper';
import type { AdminBookingResponseDto } from './dto/admin-booking-respose.dto';

@Controller(API_ENDPOINTS.ADMIN.BOOKINGS)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminBookingsController {
  constructor(
    @Inject(LIST_ADMIN_BOOKINGS_USE_CASE)
    private readonly _listAdminBookingsUseCase: IListAdminBookingsUseCase,
  ) {}

  @Get()
  async listBookings(
    @Query() query: AdminBookingListQueryDto,
  ): Promise<ApiResponse<AdminBookingResponseDto[]>> {
    const result = await this._listAdminBookingsUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return ApiResponseHelper.paginated(
      AdminBookingMapper.toResponseList(result.bookings),
      result.pagination,
      API_MESSAGES.ADMIN.BOOKINGS_RETRIEVED_SUCCESS,
    );
  }
}
