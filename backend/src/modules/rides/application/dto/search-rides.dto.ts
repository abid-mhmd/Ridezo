import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SearchRidesDto {
  @IsString()
  @Matches(/\S/, { message: 'Origin is required.' })
  originPlaceId: string;

  @IsString()
  @Matches(/\S/, { message: 'Destination is required.' })
  destinationPlaceId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Departure date must use YYYY-MM-DD format.',
  })
  departureDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
