import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
    @ApiProperty({
        example: 'LAVADOR',
        description: 'Nombre del puesto de trabajo',
        minLength: 3,
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    @Transform(({ value }) => value.toUpperCase())
    name: string;

    @ApiProperty({
        example: 'Encargado del lavado exterior e interior de vehículos',
        description: 'Descripción del puesto',
        required: false,
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;
}