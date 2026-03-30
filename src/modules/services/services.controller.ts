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
    const service = await this.servicesService.create(createServiceDto);
    return { message: 'Servicio creado exitosamente', data: service };
  }

  @servicesSwagger.removeServiceSwagger()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.servicesService.remove(+id);
    return;
  }

  @servicesSwagger.updateServiceSwagger()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateServiceDto: UpdateServiceDto) {
    await this.servicesService.update(+id, updateServiceDto);
    return;
  }

  @servicesSwagger.restoreServiceSwagger()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.servicesService.restore(+id);
    return;
  }

  @servicesSwagger.findAllServicesSwagger()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10, param = '' } = paginationDto;
    const services = await this.servicesService.findAll(active, page, limit, param);

    if (services.data.length === 0) {
      throw new NotFoundException('No se encontraron servicios registrados');
    }
    return { message: 'Servicios obtenidos exitosamente', data: services };
  }
}
