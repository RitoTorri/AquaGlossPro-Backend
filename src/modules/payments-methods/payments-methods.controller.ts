import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsMethodsService } from './payments-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';  // ← RUTA CORREGIDA (../../)
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';  // ← RUTA CORREGIDA (../../)

@ApiTags('payments-methods')
@Controller('payments-methods')
export class PaymentsMethodsController {
  constructor(private readonly paymentsMethodsService: PaymentsMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo método de pago' })
  async create(@Res() res: Response, @Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    try {
      const paymentMethod = await this.paymentsMethodsService.create(createPaymentMethodDto);
      return responses.responseSuccessful(res, 201, 'Método de pago creado exitosamente', paymentMethod);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los métodos de pago' })
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    try {
      const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
      const paymentMethods = await this.paymentsMethodsService.findAll(active, page, limit, param);
      return responses.responseSuccessful(res, 200, 'Métodos de pago obtenidos exitosamente', paymentMethods);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un método de pago' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ) {
    try {
      await this.paymentsMethodsService.update(+id, updatePaymentMethodDto);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un método de pago' })
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.paymentsMethodsService.restore(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un método de pago' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.paymentsMethodsService.remove(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }
}