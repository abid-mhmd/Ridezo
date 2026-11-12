export interface IVerifyPasswordResetOtpUseCase {
  execute(email: string, otp: string): Promise<{ resetToken: string }>;
}

export const VERIFY_PASSWORD_RESET_OTP_USE_CASE = Symbol(
  'VERIFY_PASSWORD_RESET_OTP_USE_CASE',
);
