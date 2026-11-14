export interface ILogoutUserUseCase {
  execute(refreshToken?: string): Promise<void>;
}

export const LOGOUT_USER_USE_CASE = Symbol('LOGOUT_USER_USE_CASE');
