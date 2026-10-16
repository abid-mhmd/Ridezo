export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  sendVerificationOtp(email: string, otp: string): Promise<void>;
}
