import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsNumber, Min, IsEmail, } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 1,
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    roleId: number;

    @ApiProperty({ example: 'Jesus', required: true, })
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'name must contain only letters' })
    @Transform(({ value }) => value.toLowerCase())
    name: string;

    @ApiProperty({ example: 'email@gmail.com', required: true })
    @IsNotEmpty()
    @IsEmail()
    @MinLength(15)
    @MaxLength(100)
    email: string;

    @ApiProperty({ example: '12345678', required: true })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}