import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

export class UpdateCommissionStatusDto {
  @ApiProperty({ enum: StatusPayments, example: StatusPayments.PAID })
  @IsEnum(StatusPayments)
  @IsNotEmpty()
  @Matches(/^[PC]$/, { message: 'El estado de la comisión debe de pasar de W a C o P' })
  statusPaymentConmission: StatusPayments;
}
