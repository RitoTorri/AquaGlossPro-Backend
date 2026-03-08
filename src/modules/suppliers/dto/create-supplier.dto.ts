import { IsNotEmpty, IsString, IsEmail, IsNumber, IsBoolean, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
    @ApiProperty({
        example: 'Juan Diego',
        required: true,
        description: 'Nombres del proveedor',
        minLength: 3,
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()   
    @MinLength(3)
    @MaxLength(40)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'Los nombres deben de contener solo letras y espacios' })
    @Transform(({ value }) => value.toUpperCase())
    names: string;

    @ApiProperty({
        example: 'Perdomo Sanchez',
        required: true,
        description: 'Apellidos del proveedor',
        minLength: 3,
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()   
    @MinLength(3)
    @MaxLength(40)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'Los apellidos deben de contener solo letras y espacios' })
    @Transform(({ value }) => value.toUpperCase())
    lastnames: string;

    @ApiProperty({
        example: 'juan.diego@gmail.com',
        required: true,
        description: 'Email del cliente',
        minLength: 3,
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()   
    @MinLength(12)
    @MaxLength(40)
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '+58-4121234567',
        required: true,
        description: 'Numero de telefono del cliente',
        minLength: 14,
        maxLength: 25,
    })
    @IsString()
    @IsNotEmpty()   
    @MinLength(14)
    @MaxLength(25)
    @Matches(/^\+[0-9]{2}-[0-9]{8,21}$/, { message: 'El numero de telefono debe tener entre 8 y 21 digitos. Ademas, debe de tener el prefijo +58. Example: +58-4121234567' })
    numberPhone: string;

    @ApiProperty({
        example: '1234567890',
        required: true,
        description: 'Cedula o RIF del cliente.',
        minLength: 7,
        maxLength: 15,
    })
    @IsString()
    @IsNotEmpty()   
    @MinLength(7)
    @MaxLength(15)
    @Matches(/^[VJGPE]?[0-9]{7,15}$/i, { message: 'La cedula o cedula debe tener entre 7 y 15 digitos. Ademas, no debe de tener puntos.' }) 
    ci: string;
}