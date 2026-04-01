import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  InternalServerErrorException,
  HttpException,
  // UseGuards,
} from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
// import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import Docs from './role_permissions.swagger';

@Controller('role/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Docs.createRolePermission()
  //@UseGuards(VerifyTokenGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    try {
      const rolePermission = await this.rolePermissionsService.create(createRolePermissionDto);
      return {
        message: 'Permission for role created successfully',
        data: rolePermission,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllRolePermissions()
  //@UseGuards(VerifyTokenGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const rolesPermissions = await this.rolePermissionsService.findAll(paginationDto);
      if (rolesPermissions.data.length === 0) throw new Error('No permissions found');
      return {
        message: 'Roles permissions found successfully',
        data: rolesPermissions,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateRolePermission()
  //@UseGuards(VerifyTokenGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateRolePermissionDto: UpdateRolePermissionDto) {
    try {
      await this.rolePermissionsService.update(+id, updateRolePermissionDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreRolePermission()
  //@UseGuards(VerifyTokenGuard)
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolePermissionsService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.removeRolePermission()
  //@UseGuards(VerifyTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.rolePermissionsService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
