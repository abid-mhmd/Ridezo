import { IsEmail ,IsNotEmpty,IsString,Max,MaxLength,MinLength } from "class-validator";

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
