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
import { GetUserProfileUseCase } from '../application/use-cases/get-user-profile.use-case.js';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import type { AccessTokenPayload } from '../../auth/presentation/guards/jwt-auth.guard.js';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case.js';
import { UpdateProfileDto } from '../application/dto/update-profile.dto.js';
import { UploadProfilePhotoUseCase } from '../application/use-cases/upload-profile-photo.use-case.js';
import { RemoveProfilePhotoUseCase } from '../application/use-cases/remove-profile-phot.use-case.js';
import { API_MESSAGES } from '../../../common/constants/message.constants.js';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints.constants.js';
import { UserProfileMapper } from './mappers/user-profile.mapper.js';
import type { UserProfileResponseDto } from './dto/user-profile-responce.dto.js';

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
  ): Promise<{
    success: boolean;
    user: UserProfileResponseDto;
  }> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        API_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
      );
    }

    const profile = await this.getUserProfileUseCase.execute(user.sub);

    return {
      success: true,
      user: UserProfileMapper.toResponse(profile),
    };
  }

  @Patch(API_ENDPOINTS.USERS.PROFILE)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() request: Request & { user?: AccessTokenPayload },
    @Body() dto: UpdateProfileDto,
  ): Promise<{
    success: boolean;
    user: UserProfileResponseDto;
  }> {
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
      user: UserProfileMapper.toResponse(updatedUser),
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
