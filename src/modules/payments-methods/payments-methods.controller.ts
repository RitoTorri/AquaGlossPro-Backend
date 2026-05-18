import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  Query,
  InternalServerErrorException,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { PaymentsMethodsService } from './payments-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto'; // ← RUTA CORREGIDA (../../)
import paymentsMethodsSwagger from './payments-methods.swagger';

@Controller('payments-methods')
export class PaymentsMethodsController {
  constructor(private readonly paymentsMethodsService: PaymentsMethodsService) {}

  @Post()
  @paymentsMethodsSwagger.createPaymentMethod()
  @HttpCode(201)
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    try {
      const paymentMethod = await this.paymentsMethodsService.create(createPaymentMethodDto);
      return { message: 'Método de pago creado exitosamente', data: paymentMethod };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @paymentsMethodsSwagger.findPaymentsMethods()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const paymentMethods = await this.paymentsMethodsService.findAll(paginationDto);
      return { message: 'Métodos de pago obtenidos exitosamente', data: paymentMethods };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @paymentsMethodsSwagger.updatePaymentMethod()
  @HttpCode(204)
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    try {
      await this.paymentsMethodsService.update(+id, updatePaymentMethodDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch('restore/:id')
  @paymentsMethodsSwagger.restorePaymentMethod()
  @HttpCode(200)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.paymentsMethodsService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @paymentsMethodsSwagger.removePaymentMethod()
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.paymentsMethodsService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
