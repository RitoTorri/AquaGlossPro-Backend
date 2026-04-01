import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('combos')
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo combo (con sus servicios asociados)' })
  @ApiResponse({ status: 201, description: 'Combo creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Algún recurso relacionado no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del combo ya existe' })
  @HttpCode(201)
  async create(@Body() createComboDto: CreateComboDto) {
    const combo = await this.combosService.create(createComboDto);
    return { message: 'Combo creado exitosamente', data: combo };
  }

  @Get()
  @ApiOperation({ summary: 'Listar combos con paginación' })
  @ApiResponse({ status: 200, description: 'Combos obtenidos' })
  @ApiResponse({ status: 404, description: 'No hay combos' })
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
    const result = await this.combosService.findAll(active, page, limit, param);
    if (!result.data.length) throw new NotFoundException('No hay combos para mostrar');
    return { message: 'Combos obtenidos exitosamente', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un combo por ID' })
  @ApiResponse({ status: 200, description: 'Combo encontrado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  @HttpCode(200)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const combo = await this.combosService.findOne(id);
    return { message: 'Combo encontrado', data: combo };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un combo (incluyendo sus servicios asociados)' })
  @ApiResponse({ status: 204, description: 'Combo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto (nombre duplicado o combo inactivo)' })
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateComboDto: UpdateComboDto) {
    await this.combosService.update(id, updateComboDto);
    return;
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un combo eliminado' })
  @ApiResponse({ status: 204, description: 'Combo restaurado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  @ApiResponse({ status: 409, description: 'El combo ya está activo' })
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.combosService.restore(id);
    return;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un combo (soft delete)' })
  @ApiResponse({ status: 204, description: 'Combo eliminado' })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  @ApiResponse({ status: 409, description: 'El combo ya está inactivo' })
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.combosService.remove(id);
    return;
  }
}