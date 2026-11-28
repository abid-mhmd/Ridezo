import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRecurringSubscriptionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seatsRequested: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
