import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Nombre de la categoría',
        example: 'ELECTRONICA',
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    name: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada de la categoría',
        example: 'Dispositivos móviles, laptops y accesorios',
    })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsOptional()
    description: string;
}