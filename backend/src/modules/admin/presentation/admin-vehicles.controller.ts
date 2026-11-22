import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { AdminVehicleListQueryDto } from '../application/dto/admin-vehicle-query.dto';
import {
  LIST_ADMIN_VEHICLES_USE_CASE,
  type IListAdminVehiclesUseCase,
} from '../application/interfaces/list-admin-vehicles.use-case.interface';
import {
  GET_ADMIN_VEHICLE_DETAILS_USE_CASE,
  type IGetAdminVehicleDetailsUseCase,
} from '../application/interfaces/get-admin-vehicle-details.use-case.interface';
import { AdminVehicleMapper } from './mappers/admin-vehicle.mapper';
import type {
  AdminVehicleDetailsDto,
  AdminVehicleListItemDto,
} from './dto/admin-vehicle-response.dto';

@Controller(API_ENDPOINTS.ADMIN.VEHICLES)
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminVehiclesController {
  constructor(
    @Inject(LIST_ADMIN_VEHICLES_USE_CASE)
    private readonly listAdminVehiclesUseCase: IListAdminVehiclesUseCase,

    @Inject(GET_ADMIN_VEHICLE_DETAILS_USE_CASE)
    private readonly getAdminVehicleDetailsUseCase: IGetAdminVehicleDetailsUseCase,
  ) {}

  @Get()
  async listVehicles(
    @Query() query: AdminVehicleListQueryDto,
  ): Promise<ApiResponse<AdminVehicleListItemDto[]>> {
    const result = await this.listAdminVehiclesUseCase.execute(query);

    return {
      success: true,
      message: API_MESSAGES.ADMIN.VEHICLES_RETRIEVED_SUCCESS,
      data: AdminVehicleMapper.toListResponse(result.vehicles),
      meta: result.pagination,
    };
  }

  @Get(API_ENDPOINTS.ADMIN.VEHICLE_BY_ID)
  async getVehicleDetails(
    @Param('vehicleId') vehicleId: string,
  ): Promise<ApiResponse<AdminVehicleDetailsDto>> {
    const result = await this.getAdminVehicleDetailsUseCase.execute(vehicleId);

    return {
      success: true,
      message: API_MESSAGES.ADMIN.VEHICLE_RETRIEVED_SUCCESS,
      data: AdminVehicleMapper.toDetailsResponse(result),
    };
  }
}
