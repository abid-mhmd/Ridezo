import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  UnauthorizedException,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard.js';
import { AddVehicleDto } from '../application/dto/add-vehicle.dto.js';
import { VehicleMapper } from './mappers/vehicle-mapper.js';
import type { VehicleResponseDto } from './dto/vehicle-response.dto.js';
import { VEHICLE_ENDPOINTS } from './constants/vehicle-endpoints.constants.js';
import { VEHICLE_MESSAGES } from './constants/vehicle-messages.constants.js';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface.js';
import { API_MESSAGES } from '../../../common/constants/message.constants.js';
import {
  AddVehicleUseCase,
  VehicleRegistrationAlreadyExistsError,
} from '../application/use-cases/add-vehicle.use-case.js';
import { GetMyVehiclesUseCase } from '../application/use-cases/get-my-vehicles.js';

@Controller()
export class VehicleController {
  constructor(
    private readonly addVehicleUseCase: AddVehicleUseCase,
    private readonly getMyVehiclesUseCase: GetMyVehiclesUseCase,
  ) {}

  @Post(VEHICLE_ENDPOINTS.ROOT)
  @UseGuards(JwtAuthGuard)
  async addVehicle(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: AddVehicleDto,
  ): Promise<ApiResponse<VehicleResponseDto>> {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }
    try {
      const vehicle = await this.addVehicleUseCase.execute(
        request.user.sub,
        dto,
      );

      return {
        success: true,
        message: VEHICLE_MESSAGES.CREATED,
        data: VehicleMapper.toResponse(vehicle),
      };
    } catch (error) {
      if (error instanceof VehicleRegistrationAlreadyExistsError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Get(VEHICLE_ENDPOINTS.ROOT)
  @UseGuards(JwtAuthGuard)
  async getMyVehicles(
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<VehicleResponseDto[]>> {
    const vehicles = await this.getMyVehiclesUseCase.execute(request.user.sub);

    return {
      success: true,
      message: VEHICLE_MESSAGES.RETRIEVED,
      data: VehicleMapper.toRepsoseList(vehicles),
    };
  }
}
