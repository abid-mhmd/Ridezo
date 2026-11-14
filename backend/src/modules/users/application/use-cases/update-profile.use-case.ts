import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { UpdateProfileDto } from '../dto/update-profile.dto';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import { PROFILE_PHOTO_STORAGE } from '../ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../ports/profile-photo-storage';
import type { IUpdateProfileUseCase } from '../interfaces/update-profile.use-case.interface';

@Injectable()
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }
    const updatedUser = await this.userRepository.updateProfile(userId, dto);
    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }
    if (updatedUser.profilePhotoKey) {
      updatedUser.profilePhoto = await this.profilePhotoStorage.getUrl(
        updatedUser.profilePhotoKey,
      );
    }
    return updatedUser;
  }
}
