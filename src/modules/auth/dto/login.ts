import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    @MinLength(15)
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    password: string;
}
