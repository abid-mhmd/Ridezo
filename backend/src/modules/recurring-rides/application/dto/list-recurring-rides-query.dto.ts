import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RecurringRideStatus } from '../../domain/enums/recurring-ride.enums';

export class ListRecurringRidesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(RecurringRideStatus)
  status?: RecurringRideStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
