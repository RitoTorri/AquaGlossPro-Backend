import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, ParseIntPipe } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import type { Response } from 'express';
import responses from 'src/shared/utils/responses';

@Controller('role/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) { }

  @Post()
  async create(@Res() res: Response, @Body() createRolePermissionDto: CreateRolePermissionDto) {
    try {
      const newRolePermission = await this.rolePermissionsService.create(createRolePermissionDto);
      return responses.responseSuccessful(res, 201, 'Permiso creado exitosamente', newRolePermission)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'Role not found':
          return responses.responsefailed(res, 404, 'No existe un rol con el id proporcionado.');
        case 'Permission not found':
          return responses.responsefailed(res, 404, 'No existe un permiso con el id proporcionado.');
        case 'Role already has this permission':
          return responses.responsefailed(res, 409, 'Ya el Rol tiene este permiso asignado.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    try {
      const rolesPermissions = await this.rolePermissionsService.findAll(paginationDto);
      return rolesPermissions.meta.totalItems > 0
        ? responses.responseSuccessful(res, 200, 'Permisos de roles obtenidos exitosamente', rolesPermissions)
        : responses.responsefailed(res, 404, 'No se encontraron permisos asignado a un rol.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Patch(':id')
  async update(
    @Res() res: Response, @Param('id', ParseIntPipe) id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto
  ) {
    try {
      await this.rolePermissionsService.update(+id, updateRolePermissionDto);
      return responses.responseSuccessful(res, 204)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'RolePermission not found':
          return responses.responsefailed(res, 404, 'No existe un RolePermission con el id proporcionado.');
        case 'RolePermission is inactive':
          return responses.responsefailed(res, 409, 'El RolePermission esta inactivo, no puede ser actualizado.');
        case 'Role already has this permission':
          return responses.responsefailed(res, 409, 'Ya el Rol tiene este permiso asignado.');
        case 'Permission not found':
          return responses.responsefailed(res, 404, 'No existe un permiso con el id proporcionado.');
        case 'Permission is inactive':
          return responses.responsefailed(res, 409, 'El permiso esta inactivo, no puede ser utilizado.');
        case 'Role not found':
          return responses.responsefailed(res, 404, 'No existe un rol con el id proporcionado.');
        case 'Role is inactive':
          return responses.responsefailed(res, 409, 'El rol esta inactivo, no puede ser utilizado.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolePermissionsService.restore(+id);
      return responses.responseSuccessful(res, 204)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'RolePermission not found':
          return responses.responsefailed(res, 404, 'No existe un RolePermission con el id proporcionado.');
        case 'RolePermission is active':
          return responses.responsefailed(res, 409, 'El RolePermission ya está activo, no puede ser restaurado.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolePermissionsService.remove(+id);
      return responses.responseSuccessful(res, 204)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'RolePermission not found':
          return responses.responsefailed(res, 404, 'No existe un RolePermission con el id proporcionado.');
        case 'RolePermission is inactive':
          return responses.responsefailed(res, 409, 'El RolePermission ya está inactivo, no puede ser eliminado nuevamente.');
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }
}
