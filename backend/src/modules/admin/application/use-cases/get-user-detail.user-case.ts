import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';

import { Inject } from '@nestjs/common';
import { API_MESSAGES } from '../../../../common/contstants/message.constants.js';

@Injectable()
export class GetUserDetailsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (user.role === 'admin') {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return user;
  }
}
