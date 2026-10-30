export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface TokenGenerator {
  generateRefreshToken(payload: {
    sub: string;
    jti: string;
    tokenType: 'refresh';
  }): Promise<string>;

  generateAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<string>;
}
