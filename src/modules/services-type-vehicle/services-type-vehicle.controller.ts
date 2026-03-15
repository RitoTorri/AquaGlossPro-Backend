import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { ServicesTypeVehicleService } from './services-type-vehicle.service';
import { CreateServicesTypeVehicleDto } from './dto/create-services-type-vehicle.dto';
import { UpdateServicesTypeVehicleDto } from './dto/update-services-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('services-type-vehicle')
@Controller('services-type-vehicle')
export class ServicesTypeVehicleController {
    constructor(private readonly service: ServicesTypeVehicleService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una relación servicio-tipo vehículo' })
    async create(@Res() res: Response, @Body() createDto: CreateServicesTypeVehicleDto) {
        const result = await this.service.create(createDto);
        return responses.responseSuccessful(res, 201, 'Relación creada exitosamente', result);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las relaciones' })
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        const results = await this.service.findAll(paginationDto);
        if (results.data.length === 0) {
            return responses.responseSuccessful(res, 404, 'No hay registros');
        }
        return responses.responseSuccessful(res, 200, 'Registros obtenidos exitosamente', results);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una relación por ID' })
    async findOne(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.findOne(+id);
        return responses.responseSuccessful(res, 200, 'Relación encontrada', result);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una relación' })
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateDto: UpdateServicesTypeVehicleDto,
    ) {
        const result = await this.service.update(+id, updateDto);
        return responses.responseSuccessful(res, 200, 'Relación actualizada exitosamente', result);
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar una relación eliminada' })
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.restore(+id);
        return responses.responseSuccessful(res, 200, result.message);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una relación (soft delete)' })
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        const result = await this.service.remove(+id);
        return responses.responseSuccessful(res, 200, result.message);
    }
}