import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateUserData,
  ListUsersQuery,
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
      preferences: user.preferences,

      languages: user.languages,

      completedRideCount: user.completedRideCount,
      rating: user.rating,
      reviewCount: user.reviewCount,
      googleId: user.googleId,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: id }, { $set: { emailVerified: true } })
      .exec();
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLocaleLowerCase();

    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .select(`+passwordHash`)
      .exec();

    return user ? this.toEntity(user) : null;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const result = await this.userModel
      .updateOne({ _id: userId }, { $set: { passwordHash } })
      .exec();

    if (result.matchedCount === 0) {
      throw new Error('User not found.');
    }
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ googleId }).exec();

    return user ? this.toEntity(user) : null;
  }

  async updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      about?: string;
      profilePhoto?: string;
      languages?: string[];
      preferences?: Record<string, unknown>;
      location?: {
        city?: string;
        state?: string;
      };
    },
  ): Promise<UserEntity | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        },
      )
      .select('-passwordHash')
      .lean()
      .exec() as Promise<UserEntity | null>;
  }

  async listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: UserEntity[]; total: number }> {
    const { page, limit, search } = query;

    const filter: Record<string, unknown> = { role: { $ne: 'admin' } };

    if (search?.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const searchRegex = new RegExp(escapedSearch, 'i');

      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash -googleId')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users: documents.map((user) => this.toEntity(user)),
      total,
    };
  }
}
