import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'ID del producto comprado', example: 1 })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Cantidad comprada', example: 10 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Costo unitario acordado con el proveedor', example: 25.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice: number;
}
