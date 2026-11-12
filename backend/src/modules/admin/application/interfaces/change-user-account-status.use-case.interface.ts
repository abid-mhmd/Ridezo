import type { AccountStatus } from '../../../users/domain/enums/user.enums';

export interface ChangeUserAccountStatusResult {
  id: string;
  accountStatus: AccountStatus;
}

export interface IChangeUserAccountStatusUseCase {
  execute(
    userId: string,
    status: AccountStatus,
  ): Promise<ChangeUserAccountStatusResult>;
}

export const CHANGE_USER_ACCOUNT_STATUS_USE_CASE = Symbol(
  'CHANGE_USER_ACCOUNT_STATUS_USE_CASE',
);
