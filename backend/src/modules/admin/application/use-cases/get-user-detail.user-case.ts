import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { PROFILE_PHOTO_STORAGE } from '../../../users/application/ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../../../users/application/ports/profile-photo-storage';
import { Inject } from '@nestjs/common';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import { IGetUserDetailsUseCase } from '../interfaces/get-user-details.use-case.interface';
import {
  IDENTITY_DOCUMENT_STORAGE,
  IIdentityDocumentStorage,
} from '../../../users/application/ports/identity-document-storage';

@Injectable()
export class GetUserDetailsUseCase implements IGetUserDetailsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(IDENTITY_DOCUMENT_STORAGE)
    private readonly identityDocumentStorage: IIdentityDocumentStorage,
  ) {}

  async execute(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(API_MESSAGES.ADMIN.INVALID_USER_ID);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (user.role === 'admin') {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (user.profilePhoto) {
      user.profilePhoto = await this.profilePhotoStorage.getUrl(
        user.profilePhoto,
      );
    }
    if (user.identityVerification?.documentKey) {
      user.identityVerification = {
        ...user.identityVerification,
        documentKey: await this.identityDocumentStorage.getUrl(
          user.identityVerification.documentKey,
        ),
      };
    }

    return user;
  }
}
