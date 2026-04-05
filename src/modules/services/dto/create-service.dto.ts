import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsInt, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'ID de la categoría a la que pertenece', example: 1, minimum: 1 })
  @IsInt()
  @IsNotEmpty()
  categoryId!: number;

  @ApiProperty({ example: 'LAVADO BASICO', minLength: 4, maxLength: 40, description: 'Nombre del servicio' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(40)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'El nombre del servicio solo puede contener letras y espacios' })
  @Transform(({ value }) => value.toUpperCase().trim())
  name!: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100, description: 'Porcentaje de comisión' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  comissionPercentage!: number;
}