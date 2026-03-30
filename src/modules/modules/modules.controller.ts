import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseBoolPipe,
  ParseIntPipe,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import Docs from './modules.swagger';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Docs.createdModule()
  @HttpCode(201)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    const newModule = await this.modulesService.create(createModuleDto);
    return { message: 'Módulo creado exitosamente', data: newModule };
  }

  @Docs.findAllModules()
  @HttpCode(200)
  @Get(':active')
  async findAll(@Param('active', ParseBoolPipe) active: boolean) {
    const modules = await this.modulesService.findAll(active);
    if (modules.length > 0) throw new NotFoundException('No se encontraron módulos');
    return { message: 'Módulos obtenidos exitosamente', data: modules };
  }

  @Docs.updateModule()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    await this.modulesService.update(+id, updateModuleDto);
    return;
  }

  @Docs.restoreModule()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.modulesService.restore(+id);
    return;
  }

  @Docs.deleteModule()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.modulesService.remove(+id);
    return;
  }
}
