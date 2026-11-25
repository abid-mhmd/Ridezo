import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import {
  User,
  UserSchema,
} from './infrastructure/persistence/mongoose/user.schema';
import { MongooseUserRepository } from './infrastructure/persistence/mongoose/mongoose-user.repository';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UsersController } from './presentation/users.controller';
import { SecurityModule } from '../../infrastructure/redis/security/security.module';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { UploadProfilePhotoUseCase } from './application/use-cases/upload-profile-photo.use-case';
import { RemoveProfilePhotoUseCase } from './application/use-cases/remove-profile-phot.use-case';
import { PROFILE_PHOTO_STORAGE } from './application/ports/profile-photo-storage';
import { S3ProfilePhotoStorage } from './infrastructure/storage/s3-profile-photo.storage';
import { GET_USER_PROFILE_USE_CASE } from './application/interfaces/get-user-profile.use-case.interface';
import { UPDATE_PROFILE_USE_CASE } from './application/interfaces/update-profile.use-case.interface';
import { UPLOAD_PROFILE_PHOTO_USE_CASE } from './application/interfaces/upload-profile-photo.use-case.interface';
import { REMOVE_PROFILE_PHOTO_USE_CASE } from './application/interfaces/remove-profile-photo.use-case.interface';
import { OcrModule } from '../../infrastructure/ocr/ocr.module';
import { IDENTITY_DOCUMENT_STORAGE } from './application/ports/identity-document-storage';
import { S3IdentityDocumentStorage } from './infrastructure/storage/s3-identity-document.storage';
import { SUBMIT_IDENTITY_VERIFICATION_USE_CASE } from './application/interfaces/submit-identity-verification.use-case.interface';
import { SubmitIdentityVerificationUseCase } from './application/use-cases/submit-identity-verification.use-case';
import { DrivingLicenseOcrVerifier } from './infrastructure/verification/driving-license-ocr.verifier';
import { IdentityDocumentVerifierFactory } from './infrastructure/verification/identity-document-verifier.facotry';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SecurityModule,
    OcrModule,
  ],
  controllers: [UsersController],
  providers: [
    DrivingLicenseOcrVerifier,
    IdentityDocumentVerifierFactory,
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
    {
      provide: PROFILE_PHOTO_STORAGE,
      useClass: S3ProfilePhotoStorage,
    },
    {
      provide: GET_USER_PROFILE_USE_CASE,
      useClass: GetUserProfileUseCase,
    },
    {
      provide: UPDATE_PROFILE_USE_CASE,
      useClass: UpdateProfileUseCase,
    },
    {
      provide: UPLOAD_PROFILE_PHOTO_USE_CASE,
      useClass: UploadProfilePhotoUseCase,
    },
    {
      provide: REMOVE_PROFILE_PHOTO_USE_CASE,
      useClass: RemoveProfilePhotoUseCase,
    },
    {
      provide: IDENTITY_DOCUMENT_STORAGE,
      useClass: S3IdentityDocumentStorage,
    },
    {
      provide: SUBMIT_IDENTITY_VERIFICATION_USE_CASE,
      useClass: SubmitIdentityVerificationUseCase,
    },
  ],
  exports: [USER_REPOSITORY, PROFILE_PHOTO_STORAGE, IDENTITY_DOCUMENT_STORAGE],
})
export class UsersModule {}
