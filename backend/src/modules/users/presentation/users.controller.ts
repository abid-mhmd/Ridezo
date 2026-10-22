import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
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

@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePhotoUseCase: UploadProfilePhotoUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() request: Request & { user?: AccessTokenPayload }) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return {
      user: await this.getUserProfileUseCase.execute(user.sub),
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req()
    request: Request & {
      user: { sub: string };
    },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(request.user.sub, dto);
  }

  @Post('profile/photo')
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
            new BadRequestException(
              'Only JPEG, PNG, and WebP images are allowed.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadProfilePhoto(
    @Req() request: Request & { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadProfilePhotoUseCase.execute(request.user.sub, file);
  }
}
