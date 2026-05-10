import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServicesTypeVehicleService } from './services-type-vehicle.service';
import { CreateServicesTypeVehicleDto } from './dto/create-services-type-vehicle.dto';
import { UpdateServicesTypeVehicleDto } from './dto/update-services-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('services-type-vehicle')
@Controller('services-type-vehicle')
export class ServicesTypeVehicleController {
    constructor(private readonly service: ServicesTypeVehicleService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una relación servicio-tipo vehículo' })
    @ApiResponse({ status: 201, description: 'Relación creada' })
    @ApiResponse({ status: 404, description: 'Servicio o tipo de vehículo no encontrado' })
    @ApiResponse({ status: 409, description: 'Ya existe la relación' })
    @HttpCode(201)
    async create(@Body() createDto: CreateServicesTypeVehicleDto) {
        const result = await this.service.create(createDto);
        return { message: 'Relación creada exitosamente', data: result };
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las relaciones' })
    @ApiResponse({ status: 200, description: 'Registros obtenidos' })
    @ApiResponse({ status: 404, description: 'No hay registros' })
    @HttpCode(200)
    async findAll(@Query() paginationDto: PaginationDto) {
        const results = await this.service.findAll(paginationDto);
        if (!results.data.length) throw new NotFoundException('No hay registros');
        return { message: 'Registros obtenidos exitosamente', data: results };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una relación por ID' })
    @ApiResponse({ status: 200, description: 'Relación encontrada' })
    @ApiResponse({ status: 404, description: 'Relación no encontrada' })
    @HttpCode(200)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const result = await this.service.findOne(id);
        return { message: 'Relación encontrada', data: result };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una relación' })
    @ApiResponse({ status: 200, description: 'Relación actualizada' })
    @ApiResponse({ status: 404, description: 'Relación no encontrada' })
    @ApiResponse({ status: 409, description: 'Conflicto (inactiva o duplicada)' })
    @HttpCode(200)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateServicesTypeVehicleDto) {
        const result = await this.service.update(id, updateDto);
        return { message: 'Relación actualizada exitosamente', data: result };
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar una relación eliminada' })
    @ApiResponse({ status: 200, description: 'Relación restaurada' })
    @ApiResponse({ status: 404, description: 'Relación no encontrada' })
    @ApiResponse({ status: 409, description: 'La relación ya está activa' })
    @HttpCode(200)
    async restore(@Param('id', ParseIntPipe) id: number) {
        const result = await this.service.restore(id);
        return { message: result.message, data: result };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una relación (soft delete)' })
    @ApiResponse({ status: 200, description: 'Relación eliminada' })
    @ApiResponse({ status: 404, description: 'Relación no encontrada' })
    @ApiResponse({ status: 409, description: 'La relación ya está inactiva' })
    @HttpCode(200)
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.service.remove(id);
        return { message: result.message, data: result };
    }
}