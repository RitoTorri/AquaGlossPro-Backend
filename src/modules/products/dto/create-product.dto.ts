import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, Min, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TypeUnit } from '../../../shared/enums/unit.type.enums';

export class CreateProductDto {
    @ApiProperty({
        description: 'ID de la categoría a la que pertenece',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @ApiProperty({
        example: 'SHAMPOO PARA AUTOS',
        description: 'Nombre del producto',
        minLength: 3,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'El nombre solo puede contener letras, números y espacios' })
    @Transform(({ value }) => value.toUpperCase())
    name: string;

    @ApiProperty({
        example: TypeUnit.LITERS,
        description: 'Tipo de unidad del producto: L (Litros), G (Galones), U (Unidades)',
        enum: TypeUnit,
    })
    @IsEnum(TypeUnit, { message: 'El tipo de unidad debe ser L, G o U' })
    @IsNotEmpty()
    @Transform(({ value }) => value?.toUpperCase().trim())
    unitType: TypeUnit;

    @ApiProperty({
        example: 5,
        description: 'Stock mínimo permitido',
        minimum: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    minStock: number;
}