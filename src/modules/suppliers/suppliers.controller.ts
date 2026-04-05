import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import Docs from './suppliers.swagger';

@ApiBearerAuth('access-token')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Docs.createSupplier()
  //@CheckPermission('CREATE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    try {
      const supplierCreated = await this.suppliersService.create(createSupplierDto);
      return {
        data: supplierCreated,
        message: 'Proveedor creado exitosamente',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllSuppliers()
  //@CheckPermission('READ', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const suppliers = await this.suppliersService.findAll(paginationDto);
      return {
        data: suppliers,
        message: 'Listado de proveedores exitoso',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateSupplier()
  //@CheckPermission('UPDATE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    try {
      await this.suppliersService.update(+id, updateSupplierDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreSupplier()
  //@CheckPermission('UPDATE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.suppliersService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.deleteSupplier()
  //@CheckPermission('DELETE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.suppliersService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
