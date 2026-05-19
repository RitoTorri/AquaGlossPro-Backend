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
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import jobsSwagger from './jobs.swagger';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @jobsSwagger.CreateJob()
  @HttpCode(201)
  @CheckPermission('C', 'JOBS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    try {
      const job = await this.jobsService.create(createJobDto);
      return { message: 'Puesto de trabajo creado exitosamente', data: job };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.FindJobs()
  @HttpCode(200)
  @CheckPermission('R', 'JOBS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const jobs = await this.jobsService.findAll(paginationDto);
      return { message: 'Puestos de trabajo obtenidos exitosamente', data: jobs };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.UpdateJob()
  @HttpCode(204)
  @CheckPermission('U', 'JOBS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateJobDto: UpdateJobDto) {
    try {
      await this.jobsService.update(+id, updateJobDto);
      return { message: 'Puesto de trabajo actualizado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.RestoreJob()
  @HttpCode(200)
  @CheckPermission('U', 'JOBS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.jobsService.restore(+id);
      return { message: 'Puesto de trabajo restaurado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @jobsSwagger.RemoveJob()
  @HttpCode(204)
  @CheckPermission('D', 'JOBS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.jobsService.remove(+id);
      return { message: 'Puesto de trabajo eliminado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
