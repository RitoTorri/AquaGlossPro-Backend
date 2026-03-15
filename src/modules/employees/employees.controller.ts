import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, ParseIntPipe } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un empleado' })
    @ApiCreatedResponse({ description: 'Empleado creado exitosamente' })
    @ApiNotFoundResponse({ description: 'No existe un puesto de trabajo con ese ID' })
    @ApiConflictResponse({ description: 'El email, teléfono o cédula ya está en uso' })
    async create(@Res() res: Response, @Body() createEmployeeDto: CreateEmployeeDto) {
        const result = await this.employeesService.create(createEmployeeDto);
        return responses.responseSuccessful(res, 201, 'Empleado creado exitosamente', result);
    }

    @Get()
    @ApiOperation({ summary: 'Listar empleados' })
    @ApiOkResponse({ description: 'Empleados obtenidos exitosamente' })
    @ApiNotFoundResponse({ description: 'No hay empleados' })
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const results = await this.employeesService.findEmployees(paginationDto);
        if (results.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay empleados');
        }
        return responses.responseSuccessful(res, 200, 'Empleados obtenidos exitosamente', results);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un empleado por ID' })
    @ApiOkResponse({ description: 'Empleado encontrado' })
    @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
    async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.employeesService.findOne(+id);
        return responses.responseSuccessful(res, 200, 'Empleado encontrado', result);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un empleado' })
    @ApiOkResponse({ description: 'Empleado actualizado exitosamente' })
    @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
    @ApiConflictResponse({ description: 'El email, teléfono o cédula ya está en uso' })
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
    ) {
        const result = await this.employeesService.update(+id, updateEmployeeDto);
        return responses.responseSuccessful(res, 200, 'Empleado actualizado exitosamente', result);
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar un empleado' })
    @ApiOkResponse({ description: 'Empleado restaurado exitosamente' })
    @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
    @ApiConflictResponse({ description: 'El empleado ya está activo' })
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.employeesService.restore(+id);
        return responses.responseSuccessful(res, 200, 'Empleado restaurado exitosamente', result);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un empleado' })
    @ApiOkResponse({ description: 'Empleado eliminado exitosamente' })
    @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
    @ApiConflictResponse({ description: 'El empleado ya está inactivo' })
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.employeesService.remove(+id);
        return responses.responseSuccessful(res, 200, 'Empleado eliminado exitosamente', result);
    }
}