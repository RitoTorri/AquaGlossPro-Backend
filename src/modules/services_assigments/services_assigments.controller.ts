import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicesAssigmentsService } from './services_assigments.service';
import { CreateServicesAssigmentDto } from './dto/create-services_assigment.dto';
import { UpdateServicesAssigmentDto } from './dto/update-services_assigment.dto';

@Controller('services-assigments')
export class ServicesAssigmentsController {
  constructor(private readonly servicesAssigmentsService: ServicesAssigmentsService) {}

  @Post()
  create(@Body() createServicesAssigmentDto: CreateServicesAssigmentDto) {
    return this.servicesAssigmentsService.create(createServicesAssigmentDto);
  }

  @Get()
  findAll() {
    return this.servicesAssigmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesAssigmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicesAssigmentDto: UpdateServicesAssigmentDto) {
    return this.servicesAssigmentsService.update(+id, updateServicesAssigmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesAssigmentsService.remove(+id);
  }
}
