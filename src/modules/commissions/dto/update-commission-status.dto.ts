import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

export class UpdateCommissionStatusDto {
  @ApiProperty({ enum: StatusPayments, example: StatusPayments.PAID })
  @IsEnum(StatusPayments)
  @IsNotEmpty()
  statusPaymentComission: StatusPayments;
}
