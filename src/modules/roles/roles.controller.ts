import { Controller, Get, Post, Body, Patch, Param, Res, Delete, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import type { Response } from 'express';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import responses from '../../shared/utils/responses';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  async create(@Res() res: Response, @Body() createRoleDto: RoleDto) {
    try {
      const newRole = await this.rolesService.create(createRoleDto);
      return newRole
        ? responses.responseSuccessful(res, 201, 'Rol creado exitosamente', newRole)
        : responses.responsefailed(res, 400, 'Error al crear el rol.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'Role already exists') 
        return responses.responsefailed(res, 409, 'Ya existe un rol con ese nombre. Elige otro.');
      
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Get(':active')
  async findAll(@Res() res: Response, @Param('active', ParseBoolPipe) active: boolean) {
    try {
      const roles = await this.rolesService.findAll(active);
      return roles.length > 0
        ? responses.responseSuccessful(res, 200, 'Roles encontrados exitosamente', roles)
        : responses.responsefailed(res, 404, 'No hay roles encontrados.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateRoleDto: RoleDto) {
    try {

      const roleUpdated = await this.rolesService.update(Number(id), updateRoleDto);
      return roleUpdated
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al actualizar el rol.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch(errorMessage) {
        case 'Role not found':
          return responses.responsefailed(res, 404, 'No existe un rol con el id proporcionado.');
        case 'Role is inactive':
          return responses.responsefailed(res, 409, 'El rol está inactivo. No puedes actualizarlo hasta que sea restaurado.');
        case 'Role already exists':
          return responses.responsefailed(res, 409, 'Ya existe un rol con ese nombre. Elige otro.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const roleRestored = await this.rolesService.restore(Number(id));
      return roleRestored
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al restaurar el rol.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'Role not found':
          return responses.responsefailed(res, 404, 'No existe un rol con el id proporcionado.');
        case 'Role is active':
          return responses.responsefailed(res, 409, 'El rol ya está activo, no puede ser restaurado.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const roleDeleted = await this.rolesService.remove(Number(id));
      return roleDeleted
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al eliminar el rol.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch(errorMessage) {
        case 'Role not found':
          return responses.responsefailed(res, 404, 'No existe un rol con el id proporcionado.');
        case 'Role is inactive':
          return responses.responsefailed(res, 409, 'El rol ya está inactivo, no puede ser eliminado nuevamente.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }
}
