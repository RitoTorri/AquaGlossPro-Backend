import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, Min } from 'class-validator';
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
        example: 1500.50,
        description: 'Salario base del puesto de trabajo',
        minimum: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    baseSalary: number;
}