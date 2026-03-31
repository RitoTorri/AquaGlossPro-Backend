import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiCreatedResponse, 
    ApiOkResponse, 
    ApiNotFoundResponse, 
    ApiConflictResponse,
    ApiQuery 
} from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('commissions')
@Controller('commissions')
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una nueva comisión' })
    @ApiCreatedResponse({ description: 'Comisión creada exitosamente' })
    @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
    @ApiConflictResponse({ description: 'Ya existe una comisión para este detalle de venta' })
    async create(@Res() res: Response, @Body() createCommissionDto: CreateCommissionDto) {
        const result = await this.commissionsService.create(createCommissionDto);
        return responses.responseSuccessful(res, 201, 'Comisión creada exitosamente', result);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las comisiones', description: 'Filtra por nombre o cédula del empleado usando el parámetro "search".' })
    @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o cédula del empleado' })
    @ApiOkResponse({ description: 'Comisiones obtenidas exitosamente' })
    @ApiNotFoundResponse({ description: 'No hay registros' })
    async findAll(
        @Res() res: Response,
        @Query() paginationDto: PaginationDto,
        @Query('search') search?: string,
    ) {
        const results = await this.commissionsService.findAll(paginationDto, search);
        if (results.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay registros');
        }
        return responses.responseSuccessful(res, 200, 'Comisiones obtenidas exitosamente', results);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una comisión por ID' })
    @ApiOkResponse({ description: 'Comisión encontrada' })
    @ApiNotFoundResponse({ description: 'Comisión no encontrada' })
    async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.findOne(+id);
        return responses.responseSuccessful(res, 200, 'Comisión encontrada', result);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una comisión (incluye estado y demás campos)' })
    @ApiOkResponse({ description: 'Comisión actualizada exitosamente' })
    @ApiNotFoundResponse({ description: 'Comisión no encontrada' })
    @ApiConflictResponse({ description: 'La comisión está inactiva o el empleado no existe' })
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateCommissionDto: UpdateCommissionDto,
    ) {
        const result = await this.commissionsService.update(+id, updateCommissionDto);
        return responses.responseSuccessful(res, 200, 'Comisión actualizada exitosamente', result);
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar una comisión eliminada' })
    @ApiOkResponse({ description: 'Comisión restaurada exitosamente' })
    @ApiNotFoundResponse({ description: 'Comisión no encontrada' })
    @ApiConflictResponse({ description: 'La comisión ya está activa' })
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.restore(+id);
        return responses.responseSuccessful(res, 200, result.message);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una comisión (soft delete)' })
    @ApiOkResponse({ description: 'Comisión eliminada exitosamente' })
    @ApiNotFoundResponse({ description: 'Comisión no encontrada' })
    @ApiConflictResponse({ description: 'La comisión ya está inactiva' })
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.commissionsService.remove(+id);
        return responses.responseSuccessful(res, 200, result.message);
    }
}