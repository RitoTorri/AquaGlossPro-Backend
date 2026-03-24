import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { typeCategories } from '../../../shared/enums/types.categories.enums';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Tipo de categoría. Define si pertenece a productos o servicios. P = Productos, S = Servicios',
        example: typeCategories.PRODUCTS,
        enum: typeCategories,
    })
    @IsEnum(typeCategories, { message: 'El tipo de categoría debe ser P o S' })
    @IsNotEmpty({ message: 'El tipo de categoría es obligatorio' })
    @IsString({ message: 'El tipo de categoría debe ser una cadena de texto' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    type: typeCategories;

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