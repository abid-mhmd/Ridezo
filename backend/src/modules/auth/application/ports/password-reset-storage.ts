export const PASSWORD_RESET_STORAGE = Symbol('PASSWORD_RESET_STORAGE');

export interface PasswordResetStorage {
  save(
    email: string,
    otpHash: string,
    userId: string,
    ttlSeconds: number,
  ): Promise<void>;
  find(email: string): Promise<{
    otpHash: string;
    userId: string;
  } | null>;
  delete(email: string): Promise<void>;
  acquireCooldown(email: string, ttlSeconds: number): Promise<boolean>;
  releaseCooldown(email: string): Promise<void>;
  incrementAttempts(email: string, ttlSeconds: number): Promise<number>;
}
