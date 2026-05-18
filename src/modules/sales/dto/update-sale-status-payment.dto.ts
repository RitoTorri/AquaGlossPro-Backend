import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

export class UpdateSaleStatusPaymentDto {
  @ApiProperty({ example: 'P', description: 'Estado de pago de la venta', enum: ['P', 'C'] })
  @IsNotEmpty({ message: 'El estado de pago de la venta es obligatorio' })
  @IsString({ message: 'El estado de pago de la venta debe de ser un texto' })
  @MaxLength(1, { message: 'El estado de pago de la venta debe de tener menos de 1 caracter' })
  @Matches(/^[P|C]$/, { message: 'El estado de pago de la venta debe de ser P o C' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value)) // <--- Transformación aquí
  statusPayment: StatusPayments;
}
