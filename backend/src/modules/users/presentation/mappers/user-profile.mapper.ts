import type { UserEntity } from '../../domain/entities/user.entity';
import { IdentityVerificationStatus } from '../../domain/enums/user.enums';
import type { UserProfileResponseDto } from '../dto/user-profile-responce.dto';

export class UserProfileMapper {
  static toResponse(user: UserEntity): UserProfileResponseDto {
    const kyc = user.identityVerification;

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
      idVerified: kyc?.status === IdentityVerificationStatus.VERIFIED,
      identityVerification: {
        status: kyc?.status ?? IdentityVerificationStatus.NOT_STARTED,
        documentType: kyc?.documentType ?? null,
        maskedDocumentNumber: kyc?.maskedDocumentNumber ?? null,
        expiryDate: kyc?.expiryDate ?? null,
        rejectionReason: kyc?.rejectionReason ?? null,
        submittedAt: kyc?.submittedAt ?? null,
        verifiedAt: kyc?.verifiedAt ?? null,
      },
      role: user.role,
      status: user.accountStatus,
    };
  }
}
