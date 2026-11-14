import type { RegisterUserDto } from '../dto/register-user.dto';
import type { UserEntity } from '../../../users/domain/entities/user.entity';

export interface IRegisterUserUseCase {
  execute(input: RegisterUserDto): Promise<UserEntity>;
}

export const REGISTER_USER_USE_CASE = Symbol('REGISTER_USER_USE_CASE');
