import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  Query,
  NotFoundException,
  HttpCode,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import servicesSwagger from './services.swagger';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @servicesSwagger.createServiceSwagger()
  @HttpCode(201)
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    try {
      const service = await this.servicesService.create(createServiceDto);
      return { message: 'Servicio creado exitosamente', data: service };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @servicesSwagger.removeServiceSwagger()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.servicesService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @servicesSwagger.updateServiceSwagger()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateServiceDto: UpdateServiceDto) {
    try {
      await this.servicesService.update(+id, updateServiceDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @servicesSwagger.restoreServiceSwagger()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.servicesService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @servicesSwagger.findAllServicesSwagger()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const services = await this.servicesService.findAll(paginationDto);
      return { message: 'Servicios obtenidos exitosamente', data: services };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
