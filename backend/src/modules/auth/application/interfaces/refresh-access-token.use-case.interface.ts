export interface RefreshAccessTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshAccessTokenUseCase {
  execute(refreshToken: string): Promise<RefreshAccessTokenResult>;
}

export const REFRESH_ACCESS_TOKEN_USE_CASE = Symbol(
  'REFRESH_ACCESS_TOKEN_USE_CASE',
);
