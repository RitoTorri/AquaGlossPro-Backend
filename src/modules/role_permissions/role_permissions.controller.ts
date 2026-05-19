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
  UseGuards,
} from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import Docs from './role_permissions.swagger';

@Controller('role/permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Docs.createRolePermission()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('C', 'ROLE_PERMISSIONS')
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
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('R', 'ROLE_PERMISSIONS')
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

  @Docs.restoreRolePermission()
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('U', 'ROLE_PERMISSIONS')
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
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @CheckPermission('D', 'ROLE_PERMISSIONS')
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
