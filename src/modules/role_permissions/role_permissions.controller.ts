import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, ParseIntPipe } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';
import { ApiOperation } from '@nestjs/swagger';

@Controller('role/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) { }

  @ApiOperation({summary: 'Crea un nuevo permiso para un rol'})
  @Post()
  async create(@Res() res: Response, @Body() createRolePermissionDto: CreateRolePermissionDto) {
    const rolePermission = await this.rolePermissionsService.create(createRolePermissionDto);
    return responses.responseSuccessful(res, 201, 'Permiso de rol creado exitosamente', rolePermission);
  }

  @ApiOperation({summary: 'Lista de permisos de roles'})
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const rolesPermissions = await this.rolePermissionsService.findAll(paginationDto);
    return responses.responseSuccessful(res, 200, 'Permisos de roles obtenidos exitosamente', rolesPermissions);
  }

  @ApiOperation({summary: 'Actualiza un permiso de rol'})
  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateRolePermissionDto: UpdateRolePermissionDto) {
    await this.rolePermissionsService.update(+id, updateRolePermissionDto);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Reasignar un permiso de rol'})
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.rolePermissionsService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Revocar un permiso de rol'})
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.rolePermissionsService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }
}
