import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';
import * as docs from './commissions.swagger';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) {}

    @Post()
    @docs.ApiCreateDoc()
    async create(@Res() res: Response, @Body() createCommissionDto: CreateCommissionDto) {
        const result = await this.commissionsService.create(createCommissionDto);
        return responses.responseSuccessful(res, 201, 'Comisión creada exitosamente', result);
    }

    @Get()
    @docs.ApiFindAllDoc()
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const results = await this.commissionsService.findAll(paginationDto);
        if (results.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay registros');
        }
        return responses.responseSuccessful(res, 200, 'Comisiones obtenidas exitosamente', results);
    }

    @Get(':id')
    @docs.ApiFindOneDoc()
    async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.findOne(+id);
        return responses.responseSuccessful(res, 200, 'Comisión encontrada', result);
    }

    @Patch(':id')
    @docs.ApiUpdateDoc()
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateCommissionDto: UpdateCommissionDto,
    ) {
        const result = await this.commissionsService.update(+id, updateCommissionDto);
        return responses.responseSuccessful(res, 200, 'Comisión actualizada exitosamente', result);
    }

    @Patch('restore/:id')
    @docs.ApiRestoreDoc()
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.restore(+id);
        return responses.responseSuccessful(res, 200, 'Comisión restaurada exitosamente', result);
    }

    @Delete(':id')
    @docs.ApiRemoveDoc()
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.remove(+id);
        return responses.responseSuccessful(res, 200, 'Comisión eliminada exitosamente', result);
    }
}