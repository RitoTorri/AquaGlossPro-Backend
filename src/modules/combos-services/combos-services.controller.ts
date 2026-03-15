import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { CombosServicesService } from './combos-services.service';
import { CreateCombosServiceDto } from './dto/create-combos-service.dto';
import { UpdateCombosServiceDto } from './dto/update-combos-service.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';
import * as docs from './combos-services.swagger';

@ApiTags('combos-services')
@Controller('combos-services')
export class CombosServicesController {
    constructor(private readonly service: CombosServicesService) {}

    @Post()
    @docs.ApiCreateDoc()
    async create(@Res() res: Response, @Body() createDto: CreateCombosServiceDto) {
        const result = await this.service.create(createDto);
        return responses.responseSuccessful(res, 201, 'Relación creada exitosamente', result);
    }

    @Get()
    @docs.ApiFindAllDoc()
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const results = await this.service.findAll(paginationDto);
        if (results.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay registros');
        }
        return responses.responseSuccessful(res, 200, 'Registros obtenidos exitosamente', results);
    }

    @Get(':id')
    @docs.ApiFindOneDoc()
    async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.findOne(+id);
        return responses.responseSuccessful(res, 200, 'Relación encontrada', result);
    }

    @Patch(':id')
    @docs.ApiUpdateDoc()
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateDto: UpdateCombosServiceDto,
    ) {
        const result = await this.service.update(+id, updateDto);
        return responses.responseSuccessful(res, 200, 'Relación actualizada exitosamente', result);
    }

    @Patch('restore/:id')
    @docs.ApiRestoreDoc()
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.restore(+id);
        return responses.responseSuccessful(res, 200, 'Relación restaurada exitosamente', result);
    }

    @Delete(':id')
    @docs.ApiRemoveDoc()
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.remove(+id);
        return responses.responseSuccessful(res, 200, 'Relación eliminada exitosamente', result);
    }
}