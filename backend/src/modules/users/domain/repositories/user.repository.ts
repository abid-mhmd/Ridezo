import type { UserEntity } from '../entities/user.entity.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserData = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
  create(user: CreateUserData): Promise<UserEntity>;
}
