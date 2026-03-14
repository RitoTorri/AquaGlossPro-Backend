import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTypeVehicleDto {
    @ApiProperty({
        example: 'SEDAN',
        description: 'Nombre del tipo de vehículo',
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
}