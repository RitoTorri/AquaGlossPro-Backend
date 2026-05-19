import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import Docs from './commissions.swagger';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @Docs.ApiFindAllDoc()
  @CheckPermission('R', 'COMISSIONS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.commissionsService.findAll(paginationDto);
    if (!result.data.length) throw new NotFoundException('No hay registros');
    return { message: 'Comisiones obtenidas exitosamente', data: result };
  }

  @Patch(':id_employee/status')
  @CheckPermission('U', 'COMISSIONS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
  @Docs.ApiUpdateDoc()
  @HttpCode(204)
  async updateStatus(@Param('id_employee', ParseIntPipe) idEmployee: string, @Body() statusDto: UpdateCommissionStatusDto) {
    const updated = await this.commissionsService.updateStatus(+idEmployee, statusDto);
    return { message: 'Estado de comisión actualizado', data: updated };
  }
}
