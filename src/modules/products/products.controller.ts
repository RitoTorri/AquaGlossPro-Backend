import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  InternalServerErrorException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import productsDocs from './products.swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @productsDocs.createProductSwagger()
  @HttpCode(201)
  @CheckPermission('C', 'PRODUCTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);
      return { message: 'Producto creado exitosamente', product };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.mesagge);
    }
  }

  @productsDocs.findAllProductsSwagger()
  @HttpCode(200)
  @CheckPermission('R', 'PRODUCTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const products = await this.productsService.findAll(paginationDto);
      return { message: 'Productos obtenidos exitosamente', products };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.mesagge);
    }
  }

  @productsDocs.updateProductSwagger()
  @HttpCode(204)
  @CheckPermission('U', 'PRODUCTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      await this.productsService.update(+id, updateProductDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.mesagge);
    }
  }

  @productsDocs.restoreProductSwagger()
  @HttpCode(204)
  @CheckPermission('U', 'PRODUCTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.productsService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.mesagge);
    }
  }

  @productsDocs.removeProductSwagger()
  @HttpCode(204)
  @CheckPermission('D', 'PRODUCTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.productsService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.mesagge);
    }
  }
}
