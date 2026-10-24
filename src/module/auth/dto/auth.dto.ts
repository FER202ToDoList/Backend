import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
export class EmailDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;
}
export class LoginRequestDto extends EmailDto {
  @IsString() @MinLength(8) @MaxLength(72) password: string;
}
export class RegisterRequestDto extends LoginRequestDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;
}
export class ResetPasswordDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) token: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string;
}
export class JwtPayloadDto {
  id: string;
  tokenVersion: number;
}
