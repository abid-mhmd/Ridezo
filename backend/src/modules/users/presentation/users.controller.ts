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
} from '@nestjs/common';

import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { UploadProfilePhotoUseCase } from '../application/use-cases/upload-profile-photo.use-case';
import { RemoveProfilePhotoUseCase } from '../application/use-cases/remove-profile-phot.use-case';
import { API_MESSAGES } from '../../../common/constants/message.constants';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants';
import { UserProfileMapper } from './mappers/user-profile.mapper';
import type { UserProfileResponseDto } from './dto/user-profile-responce.dto';
import type { ApiResponse } from '../../../common/interfaces/api-responce.interface';

@Controller()
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePhotoUseCase: UploadProfilePhotoUseCase,
    private readonly removeProfilePhotUseCase: RemoveProfilePhotoUseCase,
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

    const profile = await this.getUserProfileUseCase.execute(user.sub);

    return {
      success: true,
      message: API_MESSAGES.USERS.USER_RETRIEVED_SUCCESS,
      data: UserProfileMapper.toResponse(profile),
    };
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

    const updatedUser = await this.updateProfileUseCase.execute(
      request.user.sub,
      dto,
    );

    return {
      success: true,
      message: API_MESSAGES.USERS.PROFILE_UPDATED,
      data: UserProfileMapper.toResponse(updatedUser),
    };
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
    return this.uploadProfilePhotoUseCase.execute(request.user.sub, file);
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
    return this.removeProfilePhotUseCase.execute(request.user.sub);
  }
}
