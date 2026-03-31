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
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import Docs from './employees.swagger';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Docs.ApiCreateEmployeeDoc()
  @HttpCode(201)
  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    const result = await this.employeesService.create(createEmployeeDto);
    return {
      data: result,
      message: 'Empleado creado exitosamente',
    };
  }

  @Docs.ApiFindEmployeesDoc()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const results = await this.employeesService.findEmployees(paginationDto);

    if (results.data.length === 0) throw new NotFoundException({ message: 'No hay empleados para mostrar' });
    return { data: results, message: 'Empleados obtenidos exitosamente' };
  }

  @Docs.ApiUpdateEmployeeDoc()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    await this.employeesService.update(+id, updateEmployeeDto);
    return;
  }

  @Docs.ApiRemoveEmployeeDoc()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.employeesService.remove(+id);
    return;
  }

  @Docs.ApiRestoreEmployeeDoc()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.employeesService.restore(+id);
    return;
  }
}
