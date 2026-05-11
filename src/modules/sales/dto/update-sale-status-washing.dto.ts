import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StatusWashing } from '../../../shared/enums/status.washing';

export class UpdateSaleStatusWashingDto {
  @ApiProperty({ example: 'D', description: 'Estado de lavado de la venta', enum: ['W', 'I', 'D', 'C'] })
  @IsNotEmpty({ message: 'El estado de lavado de la venta es obligatorio' })
  @IsString({ message: 'El estado de lavado de la venta debe de ser un texto' })
  @MaxLength(1, { message: 'El estado de lavado de la venta debe de tener menos de 1 caracter' })
  @Matches(/^[P|C|I|D]$/, { message: 'El estado de lavado de la venta debe de ser P, C o I' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value)) // <--- Transformación aquí
  statusWashing: StatusWashing;
}
