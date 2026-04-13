import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

export class CreateCommissionDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  employeeId: number;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  saleDetailId: number;

  @ApiProperty({ example: 150.75, minimum: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  comissionTotal: number;

  @ApiProperty({ enum: StatusPayments, default: StatusPayments.PENDING })
  @IsEnum(StatusPayments)
  @IsOptional()
  statusPaymentComission?: StatusPayments;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
