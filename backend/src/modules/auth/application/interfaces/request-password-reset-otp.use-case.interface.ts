export interface IRequestPasswordResetOtpUseCase {
  execute(email: string): Promise<boolean>;
}

export const REQUEST_PASSWORD_RESET_OTP_USE_CASE = Symbol(
  'REQUEST_PASSWORD_RESET_OTP_USE_CASE',
);
