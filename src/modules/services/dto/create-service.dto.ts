import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength, Min, Max, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
    @ApiProperty({ 
        required: true,
        description: 'Nombre del servicio que vende el negocio',
        example: 'Encerado',
        minLength: 4,
        maxLength: 40
     })
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(40)
    @Matches(/^[a-zA-Z\s]+$/, { message: 'El nombre del servicio solo puede contener letras y espacios' })
    @Transform(({ value }) => value.toLowerCase())
    name: string;

    @ApiProperty({ 
        required: true,
        description: 'Porcentaje de comision que se le suna al empleado por realizar el servicio',
        example: 10,
        minimum: 0,
        maximum: 100
     })
     @IsNotEmpty()
     @IsNumber()
     @Min(1)
     @Max(100)
    comissionPercentage: number;
}