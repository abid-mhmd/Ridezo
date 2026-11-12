import type { UserEntity } from '../../../users/domain/entities/user.entity';

export interface IGetUserDetailsUseCase {
  execute(userId: string): Promise<UserEntity>;
}

export const GET_USER_DETAILS_USE_CASE = Symbol('GET_USER_DETAILS_USE_CASE');
