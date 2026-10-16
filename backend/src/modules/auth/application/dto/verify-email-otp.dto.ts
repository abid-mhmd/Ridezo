import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be exactly six digits.',
  })
  otp!: string;
}
