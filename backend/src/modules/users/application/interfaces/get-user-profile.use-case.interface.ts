import type { UserEntity } from '../../domain/entities/user.entity';

export interface IGetUserProfileUseCase {
  execute(userId: string): Promise<UserEntity>;
}

export const GET_USER_PROFILE_USE_CASE = Symbol('GET_USER_PROFILE_USE_CASE');
