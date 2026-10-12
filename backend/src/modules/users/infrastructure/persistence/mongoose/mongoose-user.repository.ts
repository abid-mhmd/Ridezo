import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CreateUserData,
  UserRepository,
} from '../../../domain/repositories/user.repository.js';
import type { UserEntity } from '../../../domain/entities/user.entity.js';
import { User, type UserDocument } from './user.schema.js';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();

    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .exec();

    return user ? this.toEntity(user) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userModel.exists({ email: normalizedEmail }).exec();

    return user !== null;
  }

  async create(userData: CreateUserData): Promise<UserEntity> {
    const user = await this.userModel.create(userData);

    return this.toEntity(user);
  }

  private toEntity(user: UserDocument): UserEntity {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      passwordHash: user.passwordHash,
      about: user.about,
      profilePhoto: user.profilePhoto,

      role: user.role,
      accountStatus: user.accountStatus,

      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,

      identityVerification: user.identityVerification,
      location: user.location,

      languages: user.languages,

      completedRideCount: user.completedRideCount,
      rating: user.rating,
      reviewCount: user.reviewCount,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
