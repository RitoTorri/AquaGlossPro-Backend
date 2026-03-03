import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import responses from 'src/shared/utils/responses';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return user
        ? responses.responseSuccessful(res, 201, "Usuario creado de manera exitosa", user)
        : responses.responsefailed(res, 400, 'No se pudo crear el usuario');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'User already exists':
          return responses.responsefailed(res, 409, "Ya existe un usuario con ese correo electrónico");
        case 'Role not found':
          return responses.responsefailed(res, 404, "No se encontró el rol especificado");
        case 'Role is inactive':
          return responses.responsefailed(res, 409, "El rol especificado está inactivo");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Get('')
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    try {
      let { active, page = 1, limit = 10 } = paginationDto;
      console.log(active);
      
      const lisUsers = await this.usersService.findAll(active, page, limit);
      return lisUsers.meta.totalItems > 0
        ? responses.responseSuccessful(res, 200, "Usuarios obtenidos de manera exitosa", lisUsers)
        : responses.responsefailed(res, 404, 'No se encontraron usuarios');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return responses.responsefailed(res, 500, errorMessage);
    }
  }


  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const userUpdated = await this.usersService.update(+id, updateUserDto);
      return userUpdated
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'No se pudo actualizar el usuario');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'User not found':
          return responses.responsefailed(res, 404, "No se encontró el usuario especificado");
        case 'User is inactive':
          return responses.responsefailed(res, 409, "El usuario especificado está inactivo");
        case 'User already exists':
          return responses.responsefailed(res, 409, "Ya existe un usuario con ese correo electrónico");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const result = await this.usersService.restore(+id);
      return result
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al restaurar usuario');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'User not found':
          return responses.responsefailed(res, 404, "No se encontró el usuario especificado");
        case 'User is already active':
          return responses.responsefailed(res, 409, "El usuario especificado ya está activo");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }


  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      const userRemoved = await this.usersService.remove(+id);
      return userRemoved
        ? responses.responseSuccessful(res, 204)
        : responses.responsefailed(res, 400, 'Error al eliminar usuario');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'User not found':
          return responses.responsefailed(res, 404, "No se encontró el usuario especificado");
        case 'User is already inactive':
          return responses.responsefailed(res, 409, "El usuario especificado ya está inactivo. No puede ser eliminado.");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }
}
