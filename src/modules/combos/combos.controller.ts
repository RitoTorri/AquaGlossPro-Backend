import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('combos')
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo combo' })
  @ApiResponse({ status: 201, description: 'Combo creado exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontró algún recurso relacionado' })
  @ApiResponse({ status: 409, description: 'El nombre del combo ya está en uso' })
  async create(@Res() res: Response, @Body() createComboDto: CreateComboDto) {
    try {
      const combo = await this.combosService.create(createComboDto);
      return responses.responseSuccessful(res, 201, 'Combo creado exitosamente', combo);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los combos' })
  @ApiResponse({ status: 200, description: 'Combos obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'No hay combos para mostrar' })
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    try {
      const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
      const combos = await this.combosService.findAll(active, page, limit, param);
      if (combos.data.length === 0) {
        return responses.responseSuccessful(res, 404, 'No hay combos registrados');
      }
      return responses.responseSuccessful(res, 200, 'Combos obtenidos exitosamente', combos);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un combo' })
  @ApiResponse({ status: 204, description: 'Combo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el combo con el ID proporcionado' })
  @ApiResponse({ status: 409, description: 'El nombre del combo ya está en uso o el combo está inactivo' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateComboDto: UpdateComboDto
  ) {
    try {
      await this.combosService.update(+id, updateComboDto);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un combo' })
  @ApiResponse({ status: 204, description: 'Combo restaurado exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el combo con el ID proporcionado' })
  @ApiResponse({ status: 409, description: 'El combo ya está activo' })
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.combosService.restore(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un combo' })
  @ApiResponse({ status: 204, description: 'Combo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el combo con el ID proporcionado' })
  @ApiResponse({ status: 409, description: 'El combo ya está inactivo' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.combosService.remove(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }
}