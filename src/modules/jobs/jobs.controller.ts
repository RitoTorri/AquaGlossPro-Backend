import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo puesto de trabajo' })
  async create(@Res() res: Response, @Body() createJobDto: CreateJobDto) {
    const job = await this.jobsService.create(createJobDto);
    return responses.responseSuccessful(res, 201, 'Puesto de trabajo creado exitosamente', job);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puestos de trabajo' })
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
    const jobs = await this.jobsService.findAll(active, page, limit, param);
    return responses.responseSuccessful(res, 200, 'Puestos de trabajo obtenidos exitosamente', jobs);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un puesto de trabajo' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateJobDto: UpdateJobDto
  ) {
    await this.jobsService.update(+id, updateJobDto);
    return responses.responseSuccessful(res, 204);
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un puesto de trabajo' })
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.jobsService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un puesto de trabajo' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.jobsService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }
}