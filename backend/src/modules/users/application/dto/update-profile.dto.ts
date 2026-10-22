import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMaxSize,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProfileLocationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  profilePhoto?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileLocationDto)
  location?: ProfileLocationDto;
}
