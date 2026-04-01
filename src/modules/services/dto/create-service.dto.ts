import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength, Min, Max, Matches, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'ID de la categoría a la que pertenece',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    required: true,
    description: 'Nombre del servicio que vende el negocio',
    example: 'Encerado',
    minLength: 4,
    maxLength: 40,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'El nombre del servicio solo puede contener letras y espacios' })
  @Transform(({ value }) => value.toUpperCase())
  name: string;

  @ApiProperty({
    required: true,
    description: 'Porcentaje de comision que se le suna al empleado por realizar el servicio',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  comissionPercentage: number;
}
