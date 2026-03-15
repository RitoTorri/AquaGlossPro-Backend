import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import type { Response } from 'express';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import Docs from './vehicles.swagger';
import responses from '../../shared/utils/responses';


@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Docs.ApiCreatedVehicleDoc()
  @Post()
  async create(@Res() res: Response, @Body() createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.create(createVehicleDto);
    return responses.responseSuccessful(res, 201, "Vehiculo creado exitosamente.", vehicle);
  }

  @Docs.ApiFindVehiclesDoc()
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const result = await this.vehiclesService.findAll(paginationDto);
    return result.meta.totalItems > 0
      ? responses.responseSuccessful(res, 200, "Listado de vehiculos exitoso.", result)
      : responses.responseSuccessful(res, 404, "No hay vehiculos disponibles.");
  }

  @Docs.ApiUpdateVehicleDoc()
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    await this.vehiclesService.update(+id, updateVehicleDto);
    return responses.responseSuccessful(res, 204);
  }

  @Docs.ApiRestoreVehicleDoc()
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.vehiclesService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @Docs.ApiRemoveVehicleDoc()
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.vehiclesService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }
}
