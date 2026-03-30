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
    const supplierCreated = await this.suppliersService.create(createSupplierDto);
    return {
      data: supplierCreated,
      message: 'Proveedor creado exitosamente',
    };
  }

  @Docs.findAllSuppliers()
  //@CheckPermission('READ', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const { active = 'true', page = 1, limit = 10, param = '' } = paginationDto;

    const suppliers = await this.suppliersService.findAll(active, page, limit, param);
    if (suppliers.data.length === 0) throw new NotFoundException('No hay proveedores registrados');
    return {
      data: suppliers,
      message: 'Listado de proveedores exitoso',
    };
  }

  @Docs.updateSupplier()
  //@CheckPermission('UPDATE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    await this.suppliersService.update(+id, updateSupplierDto);
    return;
  }

  @Docs.restoreSupplier()
  //@CheckPermission('UPDATE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.suppliersService.restore(+id);
    return;
  }

  @Docs.deleteSupplier()
  //@CheckPermission('DELETE', 'SUPPLIERS')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.suppliersService.remove(+id);
    return;
  }
}
