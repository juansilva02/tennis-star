import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) @MaxLength(256) password: string;
  @IsOptional() @IsBoolean() rememberMe?: boolean;
}
export class ForgotPasswordDto {
  @IsEmail() email: string;
}
