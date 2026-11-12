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

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SecurityModule,
  ],
  controllers: [UsersController],
  providers: [
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
  ],
  exports: [USER_REPOSITORY, PROFILE_PHOTO_STORAGE],
})
export class UsersModule {}
