import type { UserEntity } from '../../../users/domain/entities/user.entity';
import { IdentityVerificationStatus } from '../../../users/domain/enums/user.enums';
import type {
  AdminIdentityVerificationResponse,
  AdminUserDetailsResponse,
  AdminUserListItem,
} from '../../presentation/dto/admin-user-response.dto';

export class AdminUserMapper {
  private static mapIdentityVerification(
    user: UserEntity,
    includeDocumentUrl = false,
  ): AdminIdentityVerificationResponse {
    const kyc = user.identityVerification;

    return {
      status: kyc?.status ?? IdentityVerificationStatus.NOT_STARTED,
      documentType: kyc?.documentType ?? null,
      maskedDocumentNumber: kyc?.maskedDocumentNumber ?? null,
      expiryDate: kyc?.expiryDate ?? null,
      rejectionReason: kyc?.rejectionReason ?? null,
      submittedAt: kyc?.submittedAt ?? null,
      verifiedAt: kyc?.verifiedAt ?? null,
      ...(includeDocumentUrl ? { documentUrl: kyc?.documentKey ?? null } : {}),
    };
  }

  static toListItem(user: UserEntity): AdminUserListItem {
    const identityVerification = this.mapIdentityVerification(user);

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
      idVerified:
        identityVerification.status === IdentityVerificationStatus.VERIFIED,
      identityVerification,
      createdAt: user.createdAt,
    };
  }

  static toListResponse(users: UserEntity[]): AdminUserListItem[] {
    return users.map((user) => this.toListItem(user));
  }

  static toDetailsResponse(user: UserEntity): AdminUserDetailsResponse {
    const identityVerification = this.mapIdentityVerification(user, true);

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
      idVerified:
        identityVerification.status === IdentityVerificationStatus.VERIFIED,
      identityVerification,
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
