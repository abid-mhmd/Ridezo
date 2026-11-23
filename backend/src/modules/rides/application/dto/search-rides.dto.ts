import { Type } from 'class-transformer';
import {
  IsInt,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SearchRidesDto {
  // Origin coordinates
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  originLongitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLatitude: number;

  // Destination coordinates
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLongitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLatitude: number;

  // Departure date
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Departure date must use YYYY-MM-DD format.',
  })
  departureDate: string;

  // Required seats
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats: number;

  @IsOptional()
  @IsString()
  departureWindows?: string; // e.g. "morning,afternoon"

  @IsOptional()
  @IsIn(['departure', 'price-low', 'price-high'])
  sortBy?: 'departure' | 'price-low' | 'price-high';

  // Optional price filters
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

  // Pagination
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
