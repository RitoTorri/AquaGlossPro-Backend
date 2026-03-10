import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
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
        example: 12.50,
        description: 'Costo por litro del producto',
        minimum: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    unitCostLiter: number;

    @ApiProperty({
        example: 0,
        description: 'Stock actual del producto',
        minimum: 0,
        default: 0,
    })
    @IsNumber()
    @Min(0)
    currentStock: number = 0;

    @ApiProperty({
        example: 5,
        description: 'Stock mínimo permitido',
        minimum: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    minStock: number;

    @ApiProperty({
        example: 100,
        description: 'Stock máximo permitido',
        minimum: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    maxStock: number;
}