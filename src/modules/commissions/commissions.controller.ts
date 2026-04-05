import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las comisiones', description: 'Filtra por nombre o cédula del empleado usando el parámetro "search".' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o cédula del empleado' })
  @ApiResponse({ status: 200, description: 'Comisiones obtenidas' })
  @ApiResponse({ status: 404, description: 'No hay registros' })
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto, @Query('search') search?: string) {
    const result = await this.commissionsService.findAll(paginationDto, search);
    if (!result.data.length) throw new NotFoundException('No hay registros');
    return { message: 'Comisiones obtenidas exitosamente', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una comisión por ID' })
  @ApiResponse({ status: 200, description: 'Comisión encontrada' })
  @ApiResponse({ status: 404, description: 'Comisión no encontrada' })
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const commission = await this.commissionsService.findOne(id);
    return { message: 'Comisión encontrada', data: commission };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una comisión' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Comisión no encontrada' })
  @ApiResponse({ status: 409, description: 'La comisión está inactiva' })
  @HttpCode(200)
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() statusDto: UpdateCommissionStatusDto) {
    const updated = await this.commissionsService.updateStatus(id, statusDto);
    return { message: 'Estado de comisión actualizado', data: updated };
  }
}