import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      about: user.about,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      languages: user.languages,
      location: user.location,
      completedRideCount: user.completedRideCount,
      rating: user.rating,
      preferences: user.preferences,
      reviewCount: user.reviewCount,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      idVerified: user.identityVerification.status,
      role: user.role,
      status: user.accountStatus,
    };
  }
}
