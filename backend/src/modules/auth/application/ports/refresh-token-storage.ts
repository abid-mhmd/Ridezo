export const REFRESH_TOKEN_STORAGE = Symbol('REFRESH_TOKEN_STORAGE');

export interface RefreshTokenStorage {
  store(
    sessionId: string,
    tokenHash: string,
    ttlSeconds: number,
  ): Promise<void>;

  get(sessionId: string): Promise<string | null>;
  delete(sessionId: string): Promise<void>;
  rotate(
    sessionId: string,
    currentHash: string,
    newSessionId: string,
    newHash: string,
    ttlSeconds: number,
  ): Promise<boolean>;
}
