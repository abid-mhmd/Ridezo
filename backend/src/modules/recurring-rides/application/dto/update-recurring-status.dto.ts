import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { RecurringRideStatus } from '../../domain/enums/recurring-ride.enums';

export class UpdateRecurringStatusDto {
  @IsEnum(RecurringRideStatus)
  status: RecurringRideStatus;

  @IsOptional()
  @IsBoolean()
  cancelFutureRides?: boolean;
}
