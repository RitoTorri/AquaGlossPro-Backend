import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { type Response } from 'express';
import { ModulesService } from './modules.service';
import { ModuleDto } from './dto/module.dto';
import responses from 'src/shared/utils/responses';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) { }


  @Post()
  async create(@Res() res: Response, @Body() createModuleDto: ModuleDto) {
    try {
      const newModule = await this.modulesService.create(createModuleDto);
      return newModule
        ? responses.responseSuccessful(res, 201, 'Módulo creado exitosamente', newModule)
        : responses.responsefailed(res, 400, 'Error al crear el módulo.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'Module already exists') 
        return responses.responsefailed(res, 409, 'Ya existe un módulo con ese nombre. Elige otro.');
      
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Get(':active')
  async findAll(@Res() res: Response, @Param('active', ParseBoolPipe) active: boolean) {
    try {
      const modules = await this.modulesService.findAll(active);
      return modules.length > 0
        ? responses.responseSuccessful(res, 200, 'Módulos obtenidos exitosamente', modules)
        : responses.responsefailed(res, 404, 'No hay modulos registrados');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Patch(':id')
  async update(@Res() res: Response, @Param('id') id: string, @Body() updateModuleDto: ModuleDto) {
    try {
      const updatedModule = await this.modulesService.update(+id, updateModuleDto);
      return updatedModule
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al actualizar el módulo.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'Module not found':
          return responses.responsefailed(res, 404, 'Módulo no encontrado. Verifica el ID proporcionado.');
        case 'Module is inactive':
          return responses.responsefailed(res, 409, 'El módulo está inactivo. No puedes actualizarlo hasta que sea restaurado.');
        case 'Module already exists':
          return responses.responsefailed(res, 409, 'Ya existe un módulo con ese nombre. Elige otro.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const restoredModule = await this.modulesService.restore(+id);
      return restoredModule
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al restaurar el módulo.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch(errorMessage) {
        case 'Module not found':
          return responses.responsefailed(res, 404, 'Módulo no encontrado. Verifica el ID proporcionado.');
        case 'Module is active':
          return responses.responsefailed(res, 409, 'El módulo ya está activo, no puede ser restaurado.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const deletedModule = await this.modulesService.remove(+id);
      return deletedModule
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al eliminar el módulo.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'Module not found':
          return responses.responsefailed(res, 404, 'Módulo no encontrado. Verifica el ID proporcionado.');
        case 'Module is inactive':
          return responses.responsefailed(res, 409, 'El módulo ya está inactivo. No puedes eliminarlo nuevamente.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }
}
