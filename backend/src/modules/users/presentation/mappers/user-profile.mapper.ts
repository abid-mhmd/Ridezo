import type { UserEntity } from '../../domain/entities/user.entity.js';
import { IdentityVerificationStatus } from '../../domain/enums/user.enums.js';
import type { UserProfileResponseDto } from '../dto/user-profile-responce.dto.js';

export class UserProfileMapper {
  static toResponse(user: UserEntity): UserProfileResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      about: user.about,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      languages: user.languages,
      preferences: user.preferences,
      location: user.location,
      completedRideCount: user.completedRideCount,
      rating: user.rating,
      reviewCount: user.reviewCount,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      idVerified:
        user.identityVerification.status ===
        IdentityVerificationStatus.VERIFIED,
      role: user.role,
      status: user.accountStatus,
    };
  }
}
