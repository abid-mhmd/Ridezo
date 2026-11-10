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
import { CloudinaryProfilePhotoStorage } from './infrastructure/storage/cloudinary-profile-photo.storage';

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
      useClass: CloudinaryProfilePhotoStorage,
    },
    GetUserProfileUseCase,
    UpdateProfileUseCase,
    UploadProfilePhotoUseCase,
    RemoveProfilePhotoUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
