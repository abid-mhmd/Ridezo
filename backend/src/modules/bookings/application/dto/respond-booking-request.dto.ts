import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RespondBookingRequestDto {
  @IsIn(['accepted', 'rejected'])
  decision: 'accepted' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  rejectionReason?: string;
}
