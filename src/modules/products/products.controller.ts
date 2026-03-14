import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';  // ← RUTA CORREGIDA (../../)
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';  // ← RUTA CORREGIDA (../../)

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  async create(@Res() res: Response, @Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);
      return responses.responseSuccessful(res, 201, 'Producto creado exitosamente', product);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  async findAll(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    try {
      const { active = true, page = 1, limit = 10, param = '' } = paginationDto;
      const products = await this.productsService.findAll(active, page, limit, param);
      return responses.responseSuccessful(res, 200, 'Productos obtenidos exitosamente', products);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    try {
      await this.productsService.update(+id, updateProductDto);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restaurar un producto' })
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.productsService.restore(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    try {
      await this.productsService.remove(+id);
      return responses.responseSuccessful(res, 204);
    } catch (error) {
      return responses.responsefailed(res, error.status || 500, error.message);
    }
  }
}