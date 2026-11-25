import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  IDENTITY_DOCUMENT_STORAGE,
  type IIdentityDocumentStorage,
} from '../../../users/application/ports/identity-document-storage';
import { IdentityVerificationStatus } from '../../../users/domain/enums/user.enums';
import type { UserEntity } from '../../../users/domain/entities/user.entity';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import type { ReviewUserIdentityDto } from '../dto/review-user-identity.dto';
import type { IReviewUserIdentityUseCase } from '../interfaces/review-user-identity.use-case.interface';

@Injectable()
export class ReviewUserIdentityUseCase implements IReviewUserIdentityUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(IDENTITY_DOCUMENT_STORAGE)
    private readonly identityDocumentStorage: IIdentityDocumentStorage,
  ) {}

  async execute(
    userId: string,
    dto: ReviewUserIdentityDto,
  ): Promise<UserEntity> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(API_MESSAGES.ADMIN.INVALID_USER_ID);
    }

    const user = await this.userRepository.findById(userId);

    if (!user || user.role !== 'admin') {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (
      user.identityVerification.status !== IdentityVerificationStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending identity verification request can be reviewed',
      );
    }

    const isApproved = dto.decision === 'approve';

    if (!isApproved && !dto.rejectionReason?.trim()) {
      throw new BadRequestException('Please provide a rejection reason');
    }

    if (!isApproved && user.identityVerification.documentKey) {
      await this.identityDocumentStorage
        .delete(user.identityVerification.documentKey)
        .catch(() => undefined);
    }
    const now = new Date();
    const updatedUser = await this.userRepository.updateIdentityVerification(
      userId,
      {
        ...user.identityVerification,
        status: isApproved
          ? IdentityVerificationStatus.VERIFIED
          : IdentityVerificationStatus.REJECTED,
        documentKey: isApproved ? user.identityVerification.documentKey : null,
        documentHash: isApproved
          ? user.identityVerification.documentHash
          : null,
        rejectionReason: isApproved ? null : dto.rejectionReason!.trim(),
        verifiedAt: isApproved ? now : null,
        reviewedAt: now,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return updatedUser;
  }
}
