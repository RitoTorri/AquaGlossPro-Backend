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
} from '@nestjs/common';
import { TypeVehicleService } from './type-vehicle.service';
import { CreateTypeVehicleDto } from './dto/create-type-vehicle.dto';
import { UpdateTypeVehicleDto } from './dto/update-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto'; // ← RUTA CORREGIDA (../../)

@Controller('type-vehicle')
export class TypeVehicleController {
  constructor(private readonly typeVehicleService: TypeVehicleService) {}

  @Post()
  async create(@Body() createTypeVehicleDto: CreateTypeVehicleDto) {
    try {
      const typeVehicle = await this.typeVehicleService.create(createTypeVehicleDto);
      return { message: 'Tipo de vehículo creado exitosamente', data: typeVehicle };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
      const typeVehicles = await this.typeVehicleService.findAll(active, page, limit, param);

      if (typeVehicles.data.length === 0) {
        throw new NotFoundException('No se encontraron tipos de vehículos');
      }

      return { message: 'Tipos de vehículos obtenidos exitosamente', data: typeVehicles };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateTypeVehicleDto: UpdateTypeVehicleDto) {
    try {
      await this.typeVehicleService.update(+id, updateTypeVehicleDto);
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.typeVehicleService.restore(+id);
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.typeVehicleService.remove(+id);
      return;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
