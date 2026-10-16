import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class RequestEmailOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email!: string;
}
