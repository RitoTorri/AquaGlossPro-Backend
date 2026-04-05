import { Controller, Query, Get, HttpCode, InternalServerErrorException, HttpException } from '@nestjs/common';
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
    try {
      const permissions = await this.permissionsService.findAll(paginationDto);
      return { message: 'Permisos obtenidos de manera exitosa', data: permissions };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
