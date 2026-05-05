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
  NotFoundException,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import Docs from './commissions.swagger';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @Docs.ApiFindAllDoc()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.commissionsService.findAll(paginationDto);
    if (!result.data.length) throw new NotFoundException('No hay registros');
    return { message: 'Comisiones obtenidas exitosamente', data: result };
  }

  @Patch(':id_employee/status')
  @Docs.ApiUpdateDoc()
  @HttpCode(204)
  async updateStatus(@Param('id_employee', ParseIntPipe) idEmployee: string, @Body() statusDto: UpdateCommissionStatusDto) {
    const updated = await this.commissionsService.updateStatus(+idEmployee, statusDto);
    return { message: 'Estado de comisión actualizado', data: updated };
  }
}
