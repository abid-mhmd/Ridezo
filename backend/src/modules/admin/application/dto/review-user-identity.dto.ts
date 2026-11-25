import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewUserIdentityDto {
  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  rejectionReason?: string;
}
