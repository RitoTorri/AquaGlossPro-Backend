import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Query,
  InternalServerErrorException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import Docs from './modules.swagger';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Docs.createdModule()
  @HttpCode(201)
  @CheckPermission('C', 'MODULES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    try {
      const newModule = await this.modulesService.create(createModuleDto);
      return { message: 'Módulo creado exitosamente', data: newModule };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllModules()
  @HttpCode(200)
  @CheckPermission('R', 'MODULES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const modules = await this.modulesService.findAll(paginationDto);
      return { message: 'Módulos obtenidos exitosamente', data: modules };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateModule()
  @HttpCode(204)
  @CheckPermission('U', 'MODULES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    try {
      await this.modulesService.update(+id, updateModuleDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreModule()
  @HttpCode(204)
  @CheckPermission('U', 'MODULES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.modulesService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.deleteModule()
  @HttpCode(204)
  @CheckPermission('D', 'MODULES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.modulesService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
