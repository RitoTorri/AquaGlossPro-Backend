import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import jobsSwagger from './jobs.swagger';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @jobsSwagger.CreateJob()
  @HttpCode(201)
  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    try {
      const job = await this.jobsService.create(createJobDto);
      return { message: 'Puesto de trabajo creado exitosamente', data: job };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.FindJobs()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
      const jobs = await this.jobsService.findAll(active, page, limit, param);
      return { message: 'Puestos de trabajo obtenidos exitosamente', data: jobs };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.UpdateJob()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateJobDto: UpdateJobDto) {
    try {
      await this.jobsService.update(+id, updateJobDto);
      return { message: 'Puesto de trabajo actualizado exitosamente' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.RestoreJob()
  @HttpCode(200)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.jobsService.restore(+id);
      return { message: 'Puesto de trabajo restaurado exitosamente' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.RemoveJob()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.jobsService.remove(+id);
      return { message: 'Puesto de trabajo eliminado exitosamente' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
