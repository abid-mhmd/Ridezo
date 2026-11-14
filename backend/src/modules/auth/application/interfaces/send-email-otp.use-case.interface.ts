export interface ISendEmailOtpUseCase {
  execute(email: string): Promise<void>;
}

export const SEND_EMAIL_OTP_USE_CASE = Symbol('SEND_EMAIL_OTP_USE_CASE');
