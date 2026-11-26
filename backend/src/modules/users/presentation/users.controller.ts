import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';

import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { UserProfileMapper } from './mappers/user-profile.mapper';
import type { UserProfileResponseDto } from './dto/user-profile-responce.dto';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';
import {
  GET_USER_PROFILE_USE_CASE,
  IGetUserProfileUseCase,
} from '../application/interfaces/get-user-profile.use-case.interface';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';
import {
  IUpdateProfileUseCase,
  UPDATE_PROFILE_USE_CASE,
} from '../application/interfaces/update-profile.use-case.interface';
import {
  IUploadProfilePhotoUseCase,
  UPLOAD_PROFILE_PHOTO_USE_CASE,
} from '../application/interfaces/upload-profile-photo.use-case.interface';
import {
  IRemoveProfilePhotoUseCase,
  REMOVE_PROFILE_PHOTO_USE_CASE,
} from '../application/interfaces/remove-profile-photo.use-case.interface';
import {
  SUBMIT_IDENTITY_VERIFICATION_USE_CASE,
  ISubmitIdentityVerificationUseCase,
} from '../application/interfaces/submit-identity-verification.use-case.interface';
import { IDENTITY_DOCUMENT_UPLOAD_LIMITS } from '../domain/constants/identity-verification.constants';
import { SubmitIdentityVerificationDto } from '../application/dto/submit-identity-verification.dto';

@Controller()
export class UsersController {
  constructor(
    @Inject(GET_USER_PROFILE_USE_CASE)
    private readonly _getUserProfileUseCase: IGetUserProfileUseCase,

    @Inject(SUBMIT_IDENTITY_VERIFICATION_USE_CASE)
    private readonly _submitIdentityVerificationUseCase: ISubmitIdentityVerificationUseCase,

    @Inject(UPDATE_PROFILE_USE_CASE)
    private readonly _updateProfileUseCase: IUpdateProfileUseCase,

    @Inject(UPLOAD_PROFILE_PHOTO_USE_CASE)
    private readonly _uploadProfilePhotoUseCase: IUploadProfilePhotoUseCase,

    @Inject(REMOVE_PROFILE_PHOTO_USE_CASE)
    private readonly _removeProfilePhotoUseCase: IRemoveProfilePhotoUseCase,
  ) {}

  @Get(API_ENDPOINTS.USERS.PROFILE)
  @UseGuards(JwtAuthGuard)
  async getMyProfile(
    @Req() request: Request & { user?: AccessTokenPayload },
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    const profile = await this._getUserProfileUseCase.execute(user.sub);

    return ApiResponseHelper.success(
      UserProfileMapper.toResponse(profile),
      API_MESSAGES.USERS.USER_RETRIEVED_SUCCESS,
    );
  }

  @Patch(API_ENDPOINTS.USERS.PROFILE)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    const updatedUser = await this._updateProfileUseCase.execute(
      request.user.sub,
      dto,
    );

    return ApiResponseHelper.success(
      UserProfileMapper.toResponse(updatedUser),
      API_MESSAGES.USERS.PROFILE_UPDATED,
    );
  }

  @Post(API_ENDPOINTS.USERS.PROFILE_PHOTO)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          callback(
            new BadRequestException(API_MESSAGES.USERS.INVALID_PHOTO_TYPE),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadProfilePhoto(
    @Req() request: Request & { user?: AccessTokenPayload },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }
    if (!file) {
      throw new BadRequestException(API_MESSAGES.USERS.INVALID_PHOTO_TYPE);
    }

    const result = await this._uploadProfilePhotoUseCase.execute(
      request.user.sub,
      file,
    );

    return ApiResponseHelper.success(
      result,
      API_MESSAGES.USERS.PROFILE_UPDATED,
    );
  }

  @Delete(API_ENDPOINTS.USERS.PROFILE_PHOTO)
  @UseGuards(JwtAuthGuard)
  async removeProfilePhoto(
    @Req() request: Request & { user?: AccessTokenPayload },
  ) {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    const result = await this._removeProfilePhotoUseCase.execute(
      request.user.sub,
    );

    return ApiResponseHelper.success(result, API_MESSAGES.USERS.PHOTO_REMOVED);
  }

  @Post(API_ENDPOINTS.USERS.IDENTITY_VERIFICATION)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
      limits: {
        fileSize: IDENTITY_DOCUMENT_UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        if (
          !(
            IDENTITY_DOCUMENT_UPLOAD_LIMITS.ALLOWED_MIME_TYPES as readonly string[]
          ).includes(file.mimetype)
        ) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, and WEBP images are allowed.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async submitIdentityVerification(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: SubmitIdentityVerificationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    if (!request.user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }
    if (!file) {
      throw new BadRequestException('Please upload a document image.');
    }

    const updatedUser = await this._submitIdentityVerificationUseCase.execute(
      request.user.sub,
      dto,
      file,
    );

    return ApiResponseHelper.success(
      UserProfileMapper.toResponse(updatedUser),
      API_MESSAGES.USERS.IDENTITY_VERIFICATION_SUBMITTED,
    );
  }
}
