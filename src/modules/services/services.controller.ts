import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @ApiOperation({summary: 'Crea un nuevo servicio'})
  @Post()
  async create(@Res() res: Response, @Body() createServiceDto: CreateServiceDto) {
    const service = await this.servicesService.create(createServiceDto);
    return responses.responseSuccessful(res, 201, "Servicio creado exitosamente", service);
  }

  @ApiOperation({summary: 'Elimina un servicio'})
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    await this.servicesService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Actualiza un servicio'})
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    await this.servicesService.update(+id, updateServiceDto);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Restaura un servicio'})
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.servicesService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({
    summary: 'Lista de servicios',
    description: "Permite busqueda filtrada por nombres de los sevicios."
  })
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10, param = '' } = paginationDto;
    const services = await this.servicesService.findAll(active, page, limit, param);

    return services.data.length > 0
      ? responses.responseSuccessful(res, 200, 'Servicios obtenidos exitosamente', services)
      : responses.responseSuccessful(res, 404, 'No se encontraron servicios registrados.');
  }
}
