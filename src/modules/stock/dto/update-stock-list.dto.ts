import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateStockDto } from './update-stock.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockListDto {
  @ApiProperty({
    description: 'Lista de productos a actualizar',
    type: [UpdateStockDto],
    example: [
      {
        productId: 'id del producto',
        stock: 'Cantidad a restar',
        unitType: 'Formato en el que se restara: U, G o L',
      },
      {
        productId: 'id del producto',
        stock: 'Cantidad a restar',
        unitType: 'Formato en el que se restara: U, G o L',
      },
    ],
  })
  @IsArray({ message: 'Se esperaba un arreglo de productos' })
  @ValidateNested({ each: true })
  @Type(() => UpdateStockDto)
  items: UpdateStockDto[];
}
