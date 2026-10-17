export const OTP_STORAGE = Symbol('OTP_STORAGE');

export interface OtpStorage {
  save(email: string, otpHash: string, ttlSeconds: number): Promise<void>;

  find(email: string): Promise<string | null>;
  delete(email: string): Promise<void>;
  incrementAttempts(email: string, ttlSeconds: number): Promise<number>;
  acquireResendCooldown(email: string, ttlSeconds: number): Promise<boolean>;
  releaseResendCooldown(email: string): Promise<void>;
}
