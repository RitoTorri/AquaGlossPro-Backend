import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import responses from '../../shared/utils/responses';
import Docs from './employees.swagger';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Docs.ApiCreateEmployeeDoc()
  @Post()
  async create(@Res() res: Response, @Body() createEmployeeDto: CreateEmployeeDto) {
    const result = await this.employeesService.create(createEmployeeDto);
    return responses.responseSuccessful(res, 201, 'Empleado creado exitosamente', result);
  }


  @Docs.ApiFindEmployeesDoc()
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const results = await this.employeesService.findEmployees(paginationDto);
    return results.meta.itemCount > 0
      ? responses.responseSuccessful(res, 200, 'Empleados obtenidas exitosamente', results)
      : responses.responseSuccessful(res, 404, 'No hay empleados para mostrar');
  }


  @Docs.ApiUpdateEmployeeDoc()
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    await this.employeesService.update(+id, updateEmployeeDto);
    return responses.responseSuccessful(res, 204);
  }


  @Docs.ApiRemoveEmployeeDoc()
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.employeesService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }


  @Docs.ApiRestoreEmployeeDoc()
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.employeesService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }
}
