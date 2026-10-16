export const OTP_STORAGE = Symbol('OTP_STORAGE');

export interface OtpStorage {
  save(email: string, otp: string, ttlSeconds: number): Promise<void>;

  find(email: string): Promise<string | null>;
  delete(email: string): Promise<void>;
}
