import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../domain/repositories/user.repository';
import {
  IDENTITY_DOCUMENT_STORAGE,
  type IIdentityDocumentStorage,
} from '../ports/identity-document-storage';
import { IdentityDocumentVerifierFactory } from '../../infrastructure/verification/identity-document-verifier.facotry';
import { IdentityVerificationStatus } from '../../domain/enums/user.enums';
import type {
  IdentityVerification,
  UserEntity,
} from '../../domain/entities/user.entity';
import type { SubmitIdentityVerificationDto } from '../dto/submit-identity-verification.dto';
import type { ISubmitIdentityVerificationUseCase } from '../interfaces/submit-identity-verification.use-case.interface';
import { API_MESSAGES } from '../../../../common/constants/message.constants';

@Injectable()
export class SubmitIdentityVerificationUseCase implements ISubmitIdentityVerificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(IDENTITY_DOCUMENT_STORAGE)
    private readonly identityDocumentStorage: IIdentityDocumentStorage,

    private readonly verifierFactory: IdentityDocumentVerifierFactory,
  ) {}

  async execute(
    userId: string,
    dto: SubmitIdentityVerificationDto,
    file: Express.Multer.File,
  ): Promise<UserEntity> {
    if (!dto.consentGiven) {
      throw new BadRequestException(
        'Consent is required to verify your identity document.',
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (
      user.identityVerification?.status === IdentityVerificationStatus.VERIFIED
    ) {
      throw new BadRequestException('Your identity is already verified.');
    }

    // 1. Run Strategy Verifier (in-memory OCR)
    const verifier = this.verifierFactory.getVerifier(dto.documentType);
    const result = await verifier.verify({
      user: { firstName: user.firstName, lastName: user.lastName },
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    // 2. Duplicate DL prevention
    if (result.documentHash) {
      const existingOwner =
        await this.userRepository.findByIdentityDocumentHash(
          result.documentHash,
        );
      if (existingOwner && existingOwner.id !== userId) {
        throw new ConflictException(
          'This document is already linked to another Ridezo account.',
        );
      }
    }

    // 3. Delete any old pending S3 document if user is re-submitting
    if (user.identityVerification?.documentKey) {
      await this.identityDocumentStorage
        .delete(user.identityVerification.documentKey)
        .catch(() => undefined);
    }

    // 4. Only upload to S3 if manual admin review is needed
    let documentKey: string | null = null;
    if (result.status === IdentityVerificationStatus.PENDING) {
      const uploaded = await this.identityDocumentStorage.upload(userId, file);
      documentKey = uploaded.objectKey;
    }

    const now = new Date();
    const verificationData: IdentityVerification = {
      status: result.status,
      documentType: dto.documentType,
      maskedDocumentNumber: result.maskedDocumentNumber,
      documentHash:
        result.status === IdentityVerificationStatus.REJECTED
          ? undefined
          : (result.documentHash ?? undefined),
      documentKey,
      expiryDate: result.expiryDate,
      rejectionReason: result.rejectionReason,
      consentGivenAt: now,
      submittedAt: now,
      verifiedAt:
        result.status === IdentityVerificationStatus.VERIFIED ? now : null,
      reviewedAt: null,
    };

    const updatedUser = await this.userRepository.updateIdentityVerification(
      userId,
      verificationData,
    );

    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return updatedUser;
  }
}
