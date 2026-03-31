import { Controller, Query, Get, HttpCode, NotFoundException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { findAllPermissions } from './permissions.swagger';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @findAllPermissions()
  @HttpCode(200)
  @Get('')
  async getAll(@Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10 } = paginationDto;
    const permissions = await this.permissionsService.findAll(active, page, limit);
    if (!permissions) {
      throw new NotFoundException('No se encontraron permisos');
    }
    return { message: 'Permisos obtenidos de manera exitosa', data: permissions };
  }
}
