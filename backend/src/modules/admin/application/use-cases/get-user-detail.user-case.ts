import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Types } from 'mongoose';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';

import { Inject } from '@nestjs/common';

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
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
