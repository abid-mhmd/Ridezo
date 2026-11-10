import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';

import { Inject } from '@nestjs/common';
import { API_MESSAGES } from '../../../../common/constants/message.constants';

@Injectable()
export class GetUserDetailsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
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

    return user;
  }
}
