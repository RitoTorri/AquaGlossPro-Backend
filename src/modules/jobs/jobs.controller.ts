import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo puesto de trabajo' })
    @ApiCreatedResponse({ description: 'Puesto de trabajo creado exitosamente' })
    @ApiConflictResponse({ description: 'Ya existe un puesto de trabajo con ese nombre' })
    async create(@Res() res: Response, @Body() createJobDto: CreateJobDto) {
        const job = await this.jobsService.create(createJobDto);
        return responses.responseSuccessful(res, 201, 'Puesto de trabajo creado exitosamente', job);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los puestos de trabajo' })
    @ApiOkResponse({ description: 'Puestos de trabajo obtenidos exitosamente' })
    @ApiNotFoundResponse({ description: 'No hay puestos de trabajo registrados' })
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
        const jobs = await this.jobsService.findAll(active, page, limit, param);
        if (jobs.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay puestos de trabajo registrados');
        }
        return responses.responseSuccessful(res, 200, 'Puestos de trabajo obtenidos exitosamente', jobs);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un puesto de trabajo' })
    @ApiNoContentResponse({ description: 'Puesto de trabajo actualizado exitosamente' })
    @ApiNotFoundResponse({ description: 'Puesto de trabajo no encontrado' })
    @ApiConflictResponse({ description: 'Conflicto al actualizar' })
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateJobDto: UpdateJobDto,
    ) {
        await this.jobsService.update(+id, updateJobDto);
        return responses.responseSuccessful(res, 204);
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar un puesto de trabajo' })
    @ApiNoContentResponse({ description: 'Puesto de trabajo restaurado exitosamente' })
    @ApiNotFoundResponse({ description: 'Puesto de trabajo no encontrado' })
    @ApiConflictResponse({ description: 'El puesto de trabajo ya está activo' })
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        await this.jobsService.restore(+id);
        return responses.responseSuccessful(res, 204);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un puesto de trabajo' })
    @ApiNoContentResponse({ description: 'Puesto de trabajo eliminado exitosamente' })
    @ApiNotFoundResponse({ description: 'Puesto de trabajo no encontrado' })
    @ApiConflictResponse({ description: 'El puesto de trabajo ya está inactivo' })
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        await this.jobsService.remove(+id);
        return responses.responseSuccessful(res, 204);
    }
}