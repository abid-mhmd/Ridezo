import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { UserEntity } from '../../domain/entities/user.entity.js';

import { API_MESSAGES } from '../../../../common/constants/message.constants.js';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return user;
  }
}
