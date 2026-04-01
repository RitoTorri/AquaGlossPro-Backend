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
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { TypeVehicleService } from './type-vehicle.service';
import { CreateTypeVehicleDto } from './dto/create-type-vehicle.dto';
import { UpdateTypeVehicleDto } from './dto/update-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto'; // ← RUTA CORREGIDA (../../)
import Docs from './type-vehicle.swagger';

@Controller('type-vehicle')
export class TypeVehicleController {
  constructor(private readonly typeVehicleService: TypeVehicleService) {}

  @Post()
  @Docs.createTypeVehicle()
  @HttpCode(200)
  async create(@Body() createTypeVehicleDto: CreateTypeVehicleDto) {
    try {
      const typeVehicle = await this.typeVehicleService.create(createTypeVehicleDto);
      return { message: 'Tipo de vehículo creado exitosamente', data: typeVehicle };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @Docs.findAllTypeVehicles()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const typeVehicles = await this.typeVehicleService.findAll(paginationDto);
      return { message: 'Tipos de vehículos obtenidos exitosamente', data: typeVehicles };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @Docs.updateTypeVehicle()
  @HttpCode(200)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateTypeVehicleDto: UpdateTypeVehicleDto) {
    try {
      await this.typeVehicleService.update(+id, updateTypeVehicleDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch('restore/:id')
  @Docs.restoreTypeVehicle()
  @HttpCode(200)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.typeVehicleService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @Docs.deleteTypeVehicle()
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.typeVehicleService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
