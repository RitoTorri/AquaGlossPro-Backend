import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import Docs from './employees.swagger';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Docs.ApiCreateEmployeeDoc()
  @HttpCode(201)
  @CheckPermission('C', 'EMPLOYEES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      const result = await this.employeesService.create(createEmployeeDto);
      return {
        data: result,
        message: 'Empleado creado exitosamente',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiFindEmployeesDoc()
  @HttpCode(200)
  @CheckPermission('R', 'EMPLOYEES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const results = await this.employeesService.findEmployees(paginationDto);
      return { message: 'Empleados obtenidos exitosamente', results };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiUpdateEmployeeDoc()
  @HttpCode(204)
  @CheckPermission('U', 'EMPLOYEES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    try {
      await this.employeesService.update(+id, updateEmployeeDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiRemoveEmployeeDoc()
  @HttpCode(204)
  @CheckPermission('D', 'EMPLOYEES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.employeesService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.ApiRestoreEmployeeDoc()
  @HttpCode(204)
  @CheckPermission('U', 'EMPLOYEES')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.employeesService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
