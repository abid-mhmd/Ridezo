import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
