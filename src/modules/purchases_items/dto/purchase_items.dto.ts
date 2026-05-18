import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'ID del producto comprado', example: 1 })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Cantidad comprada', example: 10.5 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'La cantidad debe ser un número (puede incluir decimales)' }) // ¡EL CAMBIO MÁGICO!
  @IsPositive()
  @Min(0.01, { message: 'La cantidad mínima es 0.01' })
  quantity: number;

  @ApiProperty({ description: 'Costo unitario acordado con el proveedor', example: 25.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice: number;
}
