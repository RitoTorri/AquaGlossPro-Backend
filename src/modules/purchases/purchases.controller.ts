import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { QueryDateDto } from '../../shared/dto/query.date.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import Docs from './purchases.swagger';

@ApiBearerAuth('access-token')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Docs.createPurchase()
  //@CheckPermission('CREATE', 'PURCHASES')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const purchase = await this.purchasesService.create(createPurchaseDto);
    return {
      data: purchase,
      message: 'Purchase created successfully',
    };
  }

  @Docs.findAllPurchases()
  //@CheckPermission('READ', 'PURCHASES')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() queryDateDto: QueryDateDto) {
    const result = await this.purchasesService.findAll(queryDateDto);
    if (result.data.purchases.length === 0)
      throw new NotFoundException({
        data: result,
        message: 'Purchases not found',
      });
    return { message: 'Purchases found successfully', result };
  }

  @Docs.updatePurchase()
  //@CheckPermission('UPDATE', 'PURCHASES')
  //@UseGuards(VerifyTokenGuard, RolesGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return await this.purchasesService.update(+id, updatePurchaseDto);
  }
}
