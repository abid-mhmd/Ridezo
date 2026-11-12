export interface RefreshAdminTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshAdminTokenUseCase {
  execute(refreshToken: string): Promise<RefreshAdminTokenResult>;
}

export const REFRESH_ADMIN_TOKEN_USE_CASE = Symbol(
  'REFRESH_ADMIN_TOKEN_USE_CASE',
);
