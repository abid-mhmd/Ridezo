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
  Inject,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import { AddVehicleDto } from '../application/dto/add-vehicle.dto';
import { UpdateVehicleDto } from '../application/dto/update-vehicle.dto';
import { UploadVehicleDocumentDto } from '../application/dto/upload-vehicle-document.dto';
import { VehicleMapper } from './mappers/vehicle-mapper';
import type { VehicleResponseDto } from './dto/vehicle-response.dto';
import type { VehicleDocumentResponseDto } from './dto/vehicle-document-response.dto';
import { VEHICLE_ENDPOINTS } from './constants/vehicle-endpoints.constants';
import { VEHICLE_MESSAGES } from './constants/vehicle-messages.constants';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import type { VerifyVehicleDocumentResult } from '../application/interfaces/verify-vehicle-document.use-case.interface';
import { VehicleRegistrationAlreadyExistsError } from '../application/use-cases/add-vehicle.use-case';
import {
  ADD_VEHICLE_USE_CASE,
  IAddVehicleUseCase,
} from '../application/interfaces/add-vehicle.use-case.interface';
import {
  GET_MY_VEHICLES_USE_CASE,
  IGetMyVehiclesUseCase,
} from '../application/interfaces/get-my-vehicles.use-case.interface';
import {
  GET_VEHICLE_BY_ID_USE_CASE,
  IGetVehicleByIdUseCase,
} from '../application/interfaces/get-vehicle-by-id.use-case.interface';
import {
  IUpdateVehicleUseCase,
  UPDATE_VEHICLE_USE_CASE,
} from '../application/interfaces/update-vehicle.use-case.interface';
import {
  DEACTIVATE_VEHICLE_USE_CASE,
  IDeactivateVehicleUseCase,
} from '../application/interfaces/deactivate-vehicle.use-case.interface';
import {
  IUploadVehiclePhotoUseCase,
  UPLOAD_VEHICLE_PHOTO_USE_CASE,
} from '../application/interfaces/upload-vehicle-photo.use-case.interface';
import {
  UPLOAD_VEHICLE_DOCUMENT_USE_CASE,
  IUploadVehicleDocumentUseCase,
} from '../application/interfaces/upload-vehicle-document.use-case.interface';
import {
  GET_VEHICLE_DOCUMENTS_USE_CASE,
  IGetVehicleDocumentsUseCase,
  VehicleDocumentListResult,
} from '../application/interfaces/get-vehicle-documents.use-case.interface';
import {
  VERIFY_VEHICLE_DOCUMENT_USE_CASE,
  IVerifyVehicleDocumentUseCase,
} from '../application/interfaces/verify-vehicle-document.use-case.interface';

@Controller()
export class VehicleController {
  constructor(
    @Inject(ADD_VEHICLE_USE_CASE)
    private readonly addVehicleUseCase: IAddVehicleUseCase,

    @Inject(GET_MY_VEHICLES_USE_CASE)
    private readonly getMyVehiclesUseCase: IGetMyVehiclesUseCase,

    @Inject(GET_VEHICLE_BY_ID_USE_CASE)
    private readonly getVehicleByIdUseCase: IGetVehicleByIdUseCase,

    @Inject(UPDATE_VEHICLE_USE_CASE)
    private readonly updateVehicleUseCase: IUpdateVehicleUseCase,

    @Inject(DEACTIVATE_VEHICLE_USE_CASE)
    private readonly deactivateVehicleUseCase: IDeactivateVehicleUseCase,

    @Inject(UPLOAD_VEHICLE_PHOTO_USE_CASE)
    private readonly uploadVehiclePhotoUseCase: IUploadVehiclePhotoUseCase,

    @Inject(UPLOAD_VEHICLE_DOCUMENT_USE_CASE)
    private readonly uploadVehicleDocumentUseCase: IUploadVehicleDocumentUseCase,

    @Inject(GET_VEHICLE_DOCUMENTS_USE_CASE)
    private readonly getVehicleDocumentsUseCase: IGetVehicleDocumentsUseCase,

    @Inject(VERIFY_VEHICLE_DOCUMENT_USE_CASE)
    private readonly verifyVehicleDocumentUseCase: IVerifyVehicleDocumentUseCase,
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
  ): Promise<ApiResponse<{ vehiclePhoto: string; vehiclePhotoKey: string }>> {
    const result = await this.uploadVehiclePhotoUseCase.execute(file);

    return {
      success: true,
      message: 'Vehicle photo uploaded successfully.',
      data: result,
    };
  }

  @Post(VEHICLE_ENDPOINTS.DOCUMENTS)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('document'))
  async uploadVehicleDocument(
    @Param('vehicleId') vehicleId: string,
    @Req() request: Request & { user: AccessTokenPayload },
    @Body() dto: UploadVehicleDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^application\/pdf$|^image\/(jpeg|png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ApiResponse<VehicleDocumentResponseDto>> {
    const result = await this.uploadVehicleDocumentUseCase.execute(
      request.user.sub,
      vehicleId,
      dto,
      file,
    );

    return {
      success: true,
      message: VEHICLE_MESSAGES.DOCUMENT_UPLOADED,
      data: result,
    };
  }

  @Get(VEHICLE_ENDPOINTS.DOCUMENTS)
  @UseGuards(JwtAuthGuard)
  async getVehicleDocuments(
    @Param('vehicleId') vehicleId: string,
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<VehicleDocumentListResult[]>> {
    const documents = await this.getVehicleDocumentsUseCase.execute(
      request.user.sub,
      vehicleId,
    );

    return {
      success: true,
      message: VEHICLE_MESSAGES.RETRIEVED,
      data: documents,
    };
  }

  @Post(VEHICLE_ENDPOINTS.VERIFY_DOCUMENT)
  @UseGuards(JwtAuthGuard)
  async verifyVehicleDocument(
    @Param('documentId') documentId: string,
    @Req() request: Request & { user: AccessTokenPayload },
  ): Promise<ApiResponse<VerifyVehicleDocumentResult>> {
    const result = await this.verifyVehicleDocumentUseCase.execute(
      documentId,
      request.user.sub,
    );

    return {
      success: true,
      message: VEHICLE_MESSAGES.DOCUMENT_VERIFIED,
      data: result,
    };
  }
}
