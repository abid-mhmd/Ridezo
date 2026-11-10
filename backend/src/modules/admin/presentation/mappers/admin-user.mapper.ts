import type { UserEntity } from '../../../users/domain/entities/user.entity';
import type {
  AdminUserListItem,
  AdminUserDetailsResponse,
} from '../../presentation/dto/admin-user-response.dto';

export class AdminUserMapper {
  static toListItem(user: UserEntity): AdminUserListItem {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
    };
  }

  static toListResponse(users: UserEntity[]): AdminUserListItem[] {
    return users.map((user) => this.toListItem(user));
  }

  static toDetailsResponse(user: UserEntity): AdminUserDetailsResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      about: user.about,
      profilePhoto: user.profilePhoto,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      idVerified: user.identityVerification.status,
      languages: user.languages,
      location: user.location,
      completedRideCount: user.completedRideCount,
      rating: user.rating,
      reviewCount: user.reviewCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
