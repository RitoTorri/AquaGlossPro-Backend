import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { TypeVehicleService } from './type-vehicle.service';
import { CreateTypeVehicleDto } from './dto/create-type-vehicle.dto';
import { UpdateTypeVehicleDto } from './dto/update-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';

@ApiTags('type-vehicle')
@Controller('type-vehicle')
export class TypeVehicleController {
    constructor(private readonly typeVehicleService: TypeVehicleService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de vehículo' })
    async create(@Res() res: Response, @Body() createTypeVehicleDto: CreateTypeVehicleDto) {
        try {
            const typeVehicle = await this.typeVehicleService.create(createTypeVehicleDto);
            return responses.responseSuccessful(res, 201, 'Tipo de vehículo creado exitosamente', typeVehicle);
        } catch (error) {
            return responses.responsefailed(res, error.status || 500, error.message);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los tipos de vehículos' })
    async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
        try {
            const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
            const typeVehicles = await this.typeVehicleService.findAll(active, page, limit, param);
            return responses.responseSuccessful(res, 200, 'Tipos de vehículos obtenidos exitosamente', typeVehicles);
        } catch (error) {
            return responses.responsefailed(res, error.status || 500, error.message);
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de vehículo' })
    async update(
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateTypeVehicleDto: UpdateTypeVehicleDto
    ) {
        try {
            await this.typeVehicleService.update(+id, updateTypeVehicleDto);
            return responses.responseSuccessful(res, 204);
        } catch (error) {
            return responses.responsefailed(res, error.status || 500, error.message);
        }
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restaurar un tipo de vehículo' })
    async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        try {
            await this.typeVehicleService.restore(+id);
            return responses.responseSuccessful(res, 204);
        } catch (error) {
            return responses.responsefailed(res, error.status || 500, error.message);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de vehículo' })
    async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
        try {
            await this.typeVehicleService.remove(+id);
            return responses.responseSuccessful(res, 204);
        } catch (error) {
            return responses.responsefailed(res, error.status || 500, error.message);
        }
    }
}