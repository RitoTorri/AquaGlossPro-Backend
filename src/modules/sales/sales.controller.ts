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
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import Docs from './sales.swagger';
import { QueryDateDto } from '../../shared/dto/query.date.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Docs.createSale()
  @HttpCode(201)
  async create(@Body() createSaleDto: CreateSaleDto) {
    try {
      const sale = await this.salesService.create(createSaleDto);
      return { message: sale };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  async findAll(@Query() queryDateDto: QueryDateDto) {
    try {
      const sale = await this.salesService.findAll(queryDateDto);
      return { message: 'Ventas obtenidas obtenidas exitosamente', data: sale };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }
}
