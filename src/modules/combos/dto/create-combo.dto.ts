import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, Min, Max, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateComboDto {
    @ApiProperty({
        example: 'COMBO LAVADO COMPLETO',
        description: 'Nombre del combo',
        minLength: 3,
        maxLength: 40,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(40)
    @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'El nombre solo puede contener letras, números y espacios' })
    @Transform(({ value }) => value.toUpperCase())
    name: string;

    @ApiProperty({
        example: 15.5,
        description: 'Porcentaje de descuento aplicado al combo',
        minimum: 0,
        maximum: 100,
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage: number;

    @ApiProperty({
        example: true,
        description: 'Indica si el combo es una promoción especial',
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isPromotion?: boolean;

    @ApiProperty({
        example: '2025-12-31T23:59:59Z',
        description: 'Fecha de expiración del combo (opcional)',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    expirationDate?: Date;
}