import {
  Body,
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
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { AdminVehicleListQueryDto } from '../application/dto/admin-vehicle-query.dto';
import { ReviewVehicleDocumentDto } from '../application/dto/review-vehicle-document.dto';
import { UpdateVehicleStatusDto } from '../application/dto/update-vehicle-status.dto';
import {
  LIST_ADMIN_VEHICLES_USE_CASE,
  type IListAdminVehiclesUseCase,
} from '../application/interfaces/list-admin-vehicles.use-case.interface';
import {
  GET_ADMIN_VEHICLE_DETAILS_USE_CASE,
  type IGetAdminVehicleDetailsUseCase,
} from '../application/interfaces/get-admin-vehicle-details.use-case.interface';
import {
  REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE,
  type IReviewAdminVehicleDocumentUseCase,
} from '../application/interfaces/review-admin-vehicle-document.use-case.interface';
import {
  UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE,
  type IUpdateAdminVehicleStatusUseCase,
  type UpdateAdminVehicleStatusResult,
} from '../application/interfaces/update.admin-vehicle.status.use-case.interface';
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

    @Inject(REVIEW_ADMIN_VEHICLE_DOCUMENT_USE_CASE)
    private readonly reviewAdminVehicleDocumentUseCase: IReviewAdminVehicleDocumentUseCase,

    @Inject(UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE)
    private readonly updateAdminVehicleStatusUseCase: IUpdateAdminVehicleStatusUseCase,
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

  @Patch(API_ENDPOINTS.ADMIN.REVIEW_VEHICLE_DOCUMENT)
  async reviewVehicleDocument(
    @Param('vehicleId') vehicleId: string,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewVehicleDocumentDto,
  ): Promise<
    ApiResponse<{
      id: string;
      verificationStatus: string;
      rejectionReason: string | null;
    }>
  > {
    const updated = await this.reviewAdminVehicleDocumentUseCase.execute(
      vehicleId,
      documentId,
      dto,
    );

    return {
      success: true,
      message: API_MESSAGES.ADMIN.VEHICLE_DOCUMENT_REVIEWED_SUCCESS,
      data: {
        id: updated.id,
        verificationStatus: updated.verificationStatus,
        rejectionReason: updated.rejectionReason,
      },
    };
  }

  @Patch(API_ENDPOINTS.ADMIN.UPDATE_VEHICLE_STATUS)
  async updateVehicleStatus(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: UpdateVehicleStatusDto,
  ): Promise<ApiResponse<UpdateAdminVehicleStatusResult>> {
    const result = await this.updateAdminVehicleStatusUseCase.execute(
      vehicleId,
      dto.status,
    );

    return {
      success: true,
      message: API_MESSAGES.ADMIN.VEHICLE_STATUS_UPDATED_SUCCESS,
      data: result,
    };
  }
}
