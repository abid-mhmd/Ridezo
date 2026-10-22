import type { UserEntity } from '../entities/user.entity.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserData = Pick<
  UserEntity,
  'firstName' | 'lastName' | 'email'
> &
  Partial<
    Omit<
      UserEntity,
      'id' | 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt'
    >
  >;
export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
  create(user: CreateUserData): Promise<UserEntity>;
  markEmailVerified(id: string): Promise<void>;
  findByEmailForAuthentication(email: string): Promise<UserEntity | null>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  updateProfile(
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
  ): Promise<UserEntity | null>;
}
