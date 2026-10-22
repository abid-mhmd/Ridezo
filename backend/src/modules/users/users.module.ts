import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_REPOSITORY } from './domain/repositories/user.repository.js';
import {
  User,
  UserSchema,
} from './infrastructure/persistence/mongoose/user.schema.js';
import { MongooseUserRepository } from './infrastructure/persistence/mongoose/mongoose-user.repository.js';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case.js';
import { UsersController } from './presentation/users.controller.js';
import { SecurityModule } from '../../infrastructure/redis/security/security.module.js';

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
    GetUserProfileUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
