import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  InternalServerErrorException,
  HttpException,
  Query,
  UseGuards
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import Docs from './roles.swagger';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Docs.createRole()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('C', 'ROLES')
  @Post()
  @HttpCode(201)
  async create(@Body() createRoleDto: CreateRoleDto) {
    try {
      const role = await this.rolesService.create(createRoleDto);
      return {
        data: role,
        message: 'Role creado exitosamente',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllRoles()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('R', 'ROLES')
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const roles = await this.rolesService.findAll(paginationDto);
      return { message: 'Roles encontrados exitosamente', data: roles };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateRole()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('U', 'ROLES')
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    try {
      await this.rolesService.update(+id, updateRoleDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreRole()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('U', 'ROLES')
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolesService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.deleteRole()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('D', 'ROLES')
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolesService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
