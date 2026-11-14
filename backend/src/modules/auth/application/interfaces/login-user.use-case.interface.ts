import type { LoginUserDto } from '../dto/login-user.dto';
import type { LoginUserResult } from '../use-cases/login-user.use-case';

export interface ILoginUserUseCase {
  execute(input: LoginUserDto): Promise<LoginUserResult>;
}

export const LOGIN_USER_USE_CASE = Symbol('LOGIN_USER_USE_CASE');
