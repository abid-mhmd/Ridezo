import type { UpdateProfileDto } from '../dto/update-profile.dto';
import type { UserEntity } from '../../domain/entities/user.entity';

export interface IUpdateProfileUseCase {
  execute(userId: string, dto: UpdateProfileDto): Promise<UserEntity>;
}

export const UPDATE_PROFILE_USE_CASE = Symbol('UPDATE_PROFILE_USE_CASE');
