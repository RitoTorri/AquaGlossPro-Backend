import { Controller, Query, Res, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import type{ Response } from 'express';
import { PaginationDto } from '../../shared/dto/pagination.dto';

import responses from '../../shared/utils/responses';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @ApiOperation({summary: 'Lista de permisos'})
    @Get('')
    async getAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const { active, page = 1, limit = 10 } = paginationDto;
        const permissions = await this.permissionsService.findAll(active, page, limit);
        return permissions
            ? responses.responseSuccessful(res, 200, "Permisos obtenidos de manera exitosa", permissions)
            : responses.responsefailed(res, 404, 'No se encontraron permisos');
    }
}
