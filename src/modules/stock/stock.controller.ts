import { Controller, Body, Patch, HttpException, InternalServerErrorException, HttpCode } from '@nestjs/common';
import { StockService } from './stock.service';
import { UpdateStockListDto } from './dto/update-stock-list.dto';
import Docs from './stock.swagger';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Docs.updateStockSwagger()
  @Patch()
  @HttpCode(204)
  async update(@Body() updateStockListDto: UpdateStockListDto) {
    try {
      const result = await this.stockService.update(updateStockListDto);
      return { message: 'Inventario actualizado exitosamente', data: result };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
