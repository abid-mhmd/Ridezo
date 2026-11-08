import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards,
  ConflictException,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AddVehicleUseCase,
  VehicleRegistrationAlreadyExistsError,
} from '../application/use-cases/add-vehicle.use-case.js';
import { GetMyVehiclesUseCase } from '../application/use-cases/get-my-vehicles.js';
import { GetVehicleByIdUseCase } from '../application/use-cases/get-vehicle-by-id.use-case.js';
import { UpdateVehicleUseCase } from '../application/use-cases/update-vehicle.use-case.js';
import { UpdateVehicleDto } from '../application/dto/update-vehicle.dto.js';
import { DeactivateVehicleUseCase } from '../application/use-cases/deactivate-vehicle.use-case.js';
import { UploadVehiclePhotoUseCase } from '../application/use-cases/upload-vehicle-photo.use-case.js';

@Controller()
export class VehicleController {
  constructor(
    private readonly addVehicleUseCase: AddVehicleUseCase,
    private readonly getMyVehiclesUseCase: GetMyVehiclesUseCase,
    private readonly getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deactivateVehicleUseCase: DeactivateVehicleUseCase,
    private readonly uploadVehiclePhotoUseCase: UploadVehiclePhotoUseCase,
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

  @Get(VEHICLE_ENDPOINTS.BY_ID)
  @UseGuards(JwtAuthGuard)
  async getVehicleById(
    @Param('vehicleId') vehicleId: string,
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<VehicleResponseDto>> {
    const vehicle = await this.getVehicleByIdUseCase.execute(
      vehicleId,
      request.user.sub,
    );

    return {
      success: true,
      message: VEHICLE_MESSAGES.RETRIEVED,
      data: VehicleMapper.toResponse(vehicle),
    };
  }

  @Patch(VEHICLE_ENDPOINTS.BY_ID)
  @UseGuards(JwtAuthGuard)
  async updateVehicle(
    @Param('vehicleId') vehicleId: string,
    @Req() request: Request & { user: AccessTokenPayload },
    @Body() dto: UpdateVehicleDto,
  ): Promise<ApiResponse<VehicleResponseDto>> {
    try {
      const vehicle = await this.updateVehicleUseCase.execute(
        vehicleId,
        request.user.sub,
        dto,
      );

      return {
        success: true,
        message: VEHICLE_MESSAGES.UPDATED,
        data: VehicleMapper.toResponse(vehicle),
      };
    } catch (error) {
      if (error instanceof VehicleRegistrationAlreadyExistsError) {
        throw new ConflictException(VEHICLE_MESSAGES.DUPLICATE_REGISTRATION);
      }

      throw error;
    }
  }

  @Delete(VEHICLE_ENDPOINTS.BY_ID)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateVehicle(
    @Param('vehicleId') vehicleId: string,
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<undefined>> {
    await this.deactivateVehicleUseCase.execute(vehicleId, request.user.sub);

    return {
      success: true,
      message: VEHICLE_MESSAGES.DEACTIVATED,
    };
  }

  @Post(VEHICLE_ENDPOINTS.PHOTO)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadVehiclePhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ApiResponse<{ vehiclePhoto: string }>> {
    const result = await this.uploadVehiclePhotoUseCase.execute(file);

    return {
      success: true,
      message: 'Vehicle photo uploaded successfully.',
      data: result,
    };
  }
}
