import { Controller, Query, Res, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import responses from 'src/shared/utils/responses';
import type{ Response } from 'express';
import { PaginationDto } from 'src/shared/dto/pagination.dto';


@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get('')
    async getAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        try {
            const { active, page = 1, limit = 10 } = paginationDto;
            const permissions = await this.permissionsService.findAll(active, page, limit);
            return permissions
                ? responses.responseSuccessful(res, 200, "Permisos obtenidos de manera exitosa", permissions)
                : responses.responsefailed(res, 404, 'No se encontraron permisos');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return responses.responsefailed(res, 500, errorMessage);
        }
    }
}
