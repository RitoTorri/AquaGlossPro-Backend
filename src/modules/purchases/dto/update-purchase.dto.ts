import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

export class UpdatePurchaseDto {
  @ApiProperty({
    description: 'Nuevo estado del pago',
    enum: StatusPayments,
    example: StatusPayments.PAID,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  @IsEnum(StatusPayments, {
    message: 'El estado debe ser uno de los valores permitidos: W = WAITING, P = PAID, C = CANCELLED',
  })
  @IsNotEmpty()
  status: StatusPayments;
}
