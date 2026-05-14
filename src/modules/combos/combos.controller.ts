import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiCreateComboDoc, ApiFindAllCombosDoc, ApiUpdateComboDoc, ApiRemoveComboDoc, ApiRestoreComboDoc } from './combos.swagger';

@ApiTags('combos')
@Controller('combos')
export class CombosController {
    constructor(private readonly combosService: CombosService) {}

    @Post()
    @ApiCreateComboDoc()
    @HttpCode(201)
    async create(@Body() createComboDto: CreateComboDto) {
        const combo = await this.combosService.create(createComboDto);
        return { message: 'Combo creado exitosamente', data: combo };
    }

    @Get()
    @ApiFindAllCombosDoc()
    @HttpCode(200)
    async findAll(@Query() paginationDto: PaginationDto) {
        const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
        const result = await this.combosService.findAll(active, page, limit, param);
        if (!result.data.length) throw new NotFoundException('No hay combos para mostrar');
        return { message: 'Combos obtenidos exitosamente', data: result };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un combo por ID' })
    @HttpCode(200)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const combo = await this.combosService.findOne(id);
        return { message: 'Combo encontrado', data: combo };
    }

    @Patch(':id')
    @ApiUpdateComboDoc()
    @HttpCode(204)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateComboDto: UpdateComboDto) {
        await this.combosService.update(id, updateComboDto);
        return;
    }

    @Patch('restore/:id')
    @ApiRestoreComboDoc()
    @HttpCode(204)
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.combosService.restore(id);
        return;
    }

    @Delete(':id')
    @ApiRemoveComboDoc()
    @HttpCode(204)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.combosService.remove(id);
        return;
    }
}