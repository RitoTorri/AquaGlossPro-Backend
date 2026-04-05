import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, Min, Max, IsBoolean, IsOptional, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateComboDto {
  @ApiProperty({ example: 'COMBO LAVADO COMPLETO', minLength: 3, maxLength: 40 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'El nombre solo puede contener letras, números y espacios' })
  @Transform(({ value }) => value.toUpperCase())
  name: string;

  @ApiProperty({ example: 15.5, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPromotion?: boolean;

  @ApiProperty({ example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  expirationDate?: Date;

  @ApiProperty({ example: [1, 2, 3], description: 'IDs de los servicios-tipo-vehículo que componen el combo' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  servicesTypeVehicleIds: number[];
}