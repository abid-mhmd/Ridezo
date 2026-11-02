export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface IEmailSender {
  sendVerificationOtp(email: string, otp: string): Promise<void>;
}
