import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import Docs from './vehicles.swagger';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Docs.ApiCreatedVehicleDoc()
  @Post()
  @HttpCode(201)
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.create(createVehicleDto);
    return { message: 'Vehiculo creado exitosamente.', data: vehicle };
  }

  @Docs.ApiFindVehiclesDoc()
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.vehiclesService.findAll(paginationDto);
    if (result.meta.totalItems === 0) throw new NotFoundException('No hay vehiculos disponibles');
    return { message: 'Listado de vehiculos exitoso.', data: result };
  }

  @Docs.ApiUpdateVehicleDoc()
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    await this.vehiclesService.update(+id, updateVehicleDto);
    return;
  }

  @Docs.ApiRestoreVehicleDoc()
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.vehiclesService.restore(+id);
    return;
  }

  @Docs.ApiRemoveVehicleDoc()
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.vehiclesService.remove(+id);
    return;
  }
}
