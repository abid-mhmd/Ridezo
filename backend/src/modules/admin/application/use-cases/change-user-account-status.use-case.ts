import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';

import {
  AccountStatus,
  UserRole,
} from '../../../users/domain/enums/user.enums.js';

import { Types } from 'mongoose';
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';

@Injectable()
export class ChangeUserAccountStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, status: AccountStatus) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID.');
    }

    if (status !== AccountStatus.ACTIVE && status !== AccountStatus.SUSPENDED) {
      throw new BadRequestException(
        'Only active and suspended statuses are supported.',
      );
    }

    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser || existingUser.role === UserRole.ADMIN) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (existingUser.accountStatus === status) {
      throw new BadRequestException(`User account is already ${status}.`);
    }

    const updatedUser = await this.userRepository.updateAccountStatus(
      userId,
      status,
    );

    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return {
      id: updatedUser.id,
      accountStatus: updatedUser.accountStatus,
    };
  }
}
