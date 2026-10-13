import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { USER_REPOSITORY } from './domain/repositories/user.repository.js';

import {
  User,
  UserSchema,
} from './infrastructure/persistence/mongoose/user.schema.js';
import { MongooseUserRepository } from './infrastructure/persistence/mongoose/mongoose-user.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
