import type { UserEntity } from '../../../users/domain/entities/user.entity';
import type { ReviewUserIdentityDto } from '../dto/review-user-identity.dto';

export const REVIEW_USER_IDENTITY_USE_CASE = Symbol(
  'REVIEW_USER_IDENTITY_USE_CASE',
);

export interface IReviewUserIdentityUseCase {
  execute(userId: string, dto: ReviewUserIdentityDto): Promise<UserEntity>;
}
