import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { user_role } from '@prisma/client';

export class SignupDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsEnum(user_role as any)
    role: user_role;
}