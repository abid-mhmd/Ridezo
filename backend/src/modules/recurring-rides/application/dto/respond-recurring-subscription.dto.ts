import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RecurringSubscriptionStatus } from '../../domain/enums/recurring-ride.enums';

export class RespondRecurringSubscriptionDto {
  @IsEnum([
    RecurringSubscriptionStatus.APPROVED,
    RecurringSubscriptionStatus.REJECTED,
  ])
  status:
    RecurringSubscriptionStatus.APPROVED | RecurringSubscriptionStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  rejectionReason?: string;
}
