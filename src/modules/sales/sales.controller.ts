import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  InternalServerErrorException,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import Docs from './sales.swagger';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Docs.createSale()
  @HttpCode(201)
  async create(@Body() createSaleDto: CreateSaleDto) {
    try {
      const sale = await this.salesService.create(createSaleDto);
      return { message: 'Venta creada exitosamente', data: sale };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }
}
