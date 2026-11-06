import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class JwtPayloadDto {
    id: string;
    email: string;
    fullName?: string | null;
    role: string;
}

export class LoginRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}

export class RegisterRequestDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    fullName: string;
}

export class LoginResponseDto {
    token: string;
}

export class RegisterResponseDto {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
}
