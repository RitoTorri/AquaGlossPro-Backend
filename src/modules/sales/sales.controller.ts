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
  ParseIntPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleStatusWashingDto } from './dto/update-sale-status-washing.dto';
import { UpdateSaleStatusPaymentDto } from './dto/update-sale-status-payment.dto';
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
  @Docs.findAll()
  @HttpCode(200)
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

  @Patch('status/washing/:id')
  @Docs.updateStatusWashing()
  @HttpCode(204)
  async updateStatusWashing(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleStatusWashingDto: UpdateSaleStatusWashingDto,
  ) {
    try {
      await this.salesService.updateStatusWashing(+id, updateSaleStatusWashingDto);
      return { message: 'La venta fue actualizada exitosamente' };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  @Patch('status/payment/:id')
  @HttpCode(204)
  @Docs.updateStatusPayment()
  async updateStatusPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleStatusPaymentDto: UpdateSaleStatusPaymentDto,
  ) {
    try {
      await this.salesService.updateStatusPaymentSale(+id, updateSaleStatusPaymentDto);
      return { message: 'La venta fue actualizada exitosamente' };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error);
    }
  }
}
