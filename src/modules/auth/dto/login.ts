import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email',
        example: 'jesus@aquagloss.com',
        required: true,
        minLength: 13,
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsEmail()
    @MinLength(15)
    @MaxLength(100)
    email: string;

    @ApiProperty({
        description: 'Password',
        example: '12345678',
        required: true,
        minLength: 8,
        maxLength: 100,
    })
    @IsNotEmpty()
    password: string;
}
