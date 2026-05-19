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
  HttpCode,
  HttpException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import Docs from './vehicles.swagger';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Docs.ApiCreatedVehicleDoc()
  @Post()
  @CheckPermission('C', 'VEHICLES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(201)
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    try {
      const vehicle = await this.vehiclesService.create(createVehicleDto);
      return { message: 'Vehiculo creado exitosamente.', data: vehicle };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiFindVehiclesDoc()
  @Get()
  @CheckPermission('R', 'VEHICLES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const result = await this.vehiclesService.findAll(paginationDto);
      return { message: 'Listado de vehiculos exitoso.', data: result };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiUpdateVehicleDoc()
  @Patch(':id')
  @CheckPermission('U', 'VEHICLES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    try {
      await this.vehiclesService.update(+id, updateVehicleDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiRestoreVehicleDoc()
  @Patch('restore/:id')
  @CheckPermission('U', 'VEHICLES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.vehiclesService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiRemoveVehicleDoc()
  @Delete(':id')
  @CheckPermission('D', 'VEHICLES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.vehiclesService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
