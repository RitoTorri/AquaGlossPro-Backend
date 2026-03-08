import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import type { Response } from 'express';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import responses from '../../shared/utils/responses';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) { }

  @ApiOperation({summary: 'Crea un nuevo proveedor'})
  @Post()
  async create(@Res() res: Response, @Body() createSupplierDto: CreateSupplierDto) {
    const supplier = await this.suppliersService.create(createSupplierDto);
    return responses.responseSuccessful(res, 201, "Proveedor registrado de manera exitosa", supplier);
  }

  @ApiOperation({summary: 'Elimina un proveedor'})
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.suppliersService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Actualiza un proveedor'})
  @Patch(':id')
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto
  ) {
    await this.suppliersService.update(+id, updateSupplierDto);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Restaura un proveedor'})
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.suppliersService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({
    summary: 'Lista de proveedores',
    description: "Permite busqueda filtrada por nombres, apellidos, eail, telfono y cedula o rif."
  })
  @Get()
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
    const suppliers = await this.suppliersService.findAll(active, page, limit, param);
    return suppliers.data.length > 0
      ? responses.responseSuccessful(res, 200, "Listado de proveedores exitoso", suppliers)
      : responses.responseSuccessful(res, 404, "No se encontraron proveedores registrados.");
  }
}
