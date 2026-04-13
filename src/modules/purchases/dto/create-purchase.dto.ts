import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchaseItemDto } from '../../purchases_items/dto/purchase_items.dto';

export class CreatePurchaseDto {
  @ApiProperty({ description: 'ID del proveedor', example: 1 })
  @IsInt()
  @IsNotEmpty()
  supplierId: number;

  @ApiProperty({ description: 'ID del método de pago utilizado', example: 2 })
  @IsInt()
  @IsNotEmpty()
  paymentMethodId: number;

  @ApiProperty({
    type: [CreatePurchaseItemDto],
    description: 'Lista de productos incluidos en la compra',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
