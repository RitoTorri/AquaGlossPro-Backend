import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseBoolPipe, ParseIntPipe, Query } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import responses from '../../shared/utils/responses';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @Post()
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return responses.responseSuccessful(res, 201, 'Usuario creado exitosamente', user);
  }

<<<<<<< HEAD
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10 } = paginationDto;
    const users = await this.usersService.findAll(active, page, limit);
=======
  @ApiOperation({ summary: 'Obtener todos los usuarios o filtrar por nombre' })
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10, param = '' } = paginationDto;
    const users = await this.usersService.findAll(active, page, limit, param);
>>>>>>> jesus
    return responses.responseSuccessful(res, 200, 'Usuarios obtenidos exitosamente', users);
  }

  @ApiOperation({ summary: 'Actualizar un usuario' })
  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(+id, updateUserDto);
    return responses.responseSuccessful(res, 204);
<<<<<<< HEAD
  }

=======
  } 

  @ApiOperation({ summary: 'Restaurar un usuario' })
>>>>>>> jesus
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.usersService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

<<<<<<< HEAD
=======
  @ApiOperation({ summary: 'Eliminar un usuario' })
>>>>>>> jesus
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.usersService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }
}
