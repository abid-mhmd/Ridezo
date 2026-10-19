export const PASSWORD_RESET_STORAGE = Symbol('PASSWORD_RESET_STORAGE');

export interface PasswordResetStorage {
  save(email: string, tokenHash: string, ttlSeconds: number): Promise<void>;

  acquireCooldown(email: string, ttlSecond: number): Promise<boolean>;
  releaseCooldown(email: string): Promise<void>;
  consume(tokenHash: string): Promise<string | null>;
}
