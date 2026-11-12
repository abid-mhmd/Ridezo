export interface IVerifyEmailOtpUseCase {
  execute(email: string, otp: string): Promise<void>;
}

export const VERIFY_EMAIL_OTP_USE_CASE = Symbol('VERIFY_EMAIL_OTP_USE_CASE');
