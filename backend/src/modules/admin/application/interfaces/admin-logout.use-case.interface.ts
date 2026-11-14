export interface IAdminLogoutUseCase {
  execute(refreshToken?: string): Promise<void>;
}

export const ADMIN_LOGOUT_USE_CASE = Symbol('ADMIN_LOGOUT_USE_CASE');
