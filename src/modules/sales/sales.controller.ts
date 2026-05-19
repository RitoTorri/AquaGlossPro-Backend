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
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleStatusWashingDto } from './dto/update-sale-status-washing.dto';
import { UpdateSaleStatusPaymentDto } from './dto/update-sale-status-payment.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { QueryDateDto } from '../../shared/dto/query.date.dto';
import Docs from './sales.swagger';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Docs.createSale()
  @CheckPermission('C', 'SALES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('R', 'SALES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('U', 'SALES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('U', 'SALES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
