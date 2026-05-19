import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TypeUnit } from '../../../shared/enums/unit.type.enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El id del producto es obligatorio' })
  @Min(1, { message: 'El id del producto debe ser mayor a 0' })
  productId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @Min(0.01, { message: 'El stock debe ser mayor a 0.01' })
  stock: number;

  @IsNotEmpty({ message: 'El tipo de unidad es obligatorio' })
  @IsEnum(TypeUnit, { message: 'El tipo de unidad es invalido, debe de ser U, G o L' })
  unitType: TypeUnit;
}
