import type { UserEntity } from '../../domain/entities/user.entity';
import type { SubmitIdentityVerificationDto } from '../dto/submit-identity-verification.dto';

export const SUBMIT_IDENTITY_VERIFICATION_USE_CASE = Symbol(
  'SUBMIT_IDENTITY_VERIFICATION_USE_CASE',
);

export interface ISubmitIdentityVerificationUseCase {
  execute(
    userId: string,
    dto: SubmitIdentityVerificationDto,
    file: Express.Multer.File,
  ): Promise<UserEntity>;
}
