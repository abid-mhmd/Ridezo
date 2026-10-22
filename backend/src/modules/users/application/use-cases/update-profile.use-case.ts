import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { UpdateProfileDto } from '../dto/update-profile.dto.js';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updatedUser = await this.userRepository.updateProfile(userId, dto);
    if (!updatedUser) {
      throw new NotFoundException('User not found.');
    }
    return updatedUser;
  }
}
