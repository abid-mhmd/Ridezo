export interface IResetPasswordUseCase {
  execute(resetToken: string, newPassword: string): Promise<void>;
}

export const RESET_PASSWORD_USE_CASE = Symbol('RESET_PASSWORD_USE_CASE');
