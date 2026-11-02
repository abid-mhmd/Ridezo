export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface ITokenService {
  generateAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<string>;

  generateRefreshToken(payload: {
    sub: string;
    jti: string;
    tokenType: 'refresh';
  }): Promise<string>;

  verifyAccessToken<T extends object>(token: string): Promise<T>;
  verifyRefreshToken<T extends object>(token: string): Promise<T>;
  getRefreshTokenTtl(): number;
}
