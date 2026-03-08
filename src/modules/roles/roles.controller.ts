import { Controller, Get, Post, Body, Patch, Param, Res, Delete, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import responses from '../../shared/utils/responses';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  async create(@Res() res: Response, @Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return responses.responseSuccessful(res, 201, 'Rol creado exitosamente', role);
  }


  @Get()
  async findAll(@Res() res: Response) {
    const roles = await this.rolesService.findAll();
    return responses.responseSuccessful(res, 200, 'Roles obtenidos exitosamente', roles);
  }


  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    await this.rolesService.update(+id, updateRoleDto);
    return responses.responseSuccessful(res, 204);
  }


  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.rolesService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }


  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.rolesService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }
}
