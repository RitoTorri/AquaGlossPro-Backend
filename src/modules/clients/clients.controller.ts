import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import responses from '../../shared/utils/responses';
import type { Response } from 'express';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @ApiOperation({summary: 'Crea un nuevo cliente'})
  @Post()
  async create(@Res() res: Response, @Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return responses.responseSuccessful(res, 201, 'Cliente creado exitosamente', client);
  }

  @ApiOperation({summary: 'Elimina un cliente'})
  @Delete(':id')
  async remove(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.clientsService.remove(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Actualiza un cliente'})
  @Patch(':id')
  async update(@Res() res: Response, @Param('id', ParseIntPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    await this.clientsService.update(+id, updateClientDto);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({summary: 'Restaura un cliente'})
  @Patch('restore/:id')
  async restore(@Res() res: Response, @Param('id', ParseIntPipe) id: string) {
    await this.clientsService.restore(+id);
    return responses.responseSuccessful(res, 204);
  }

  @ApiOperation({
    summary: 'Lista de clientes',
    description: "Permite busqueda filtrada por nombres, apellidos, cedula y cedula - Rif"
  })
  @Get()
  async findAll(
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
  ) {
    const { active, page = 1, limit = 10, param } = paginationDto;
    const clients = await this.clientsService.findAll(active, page, limit, param || '');
    return responses.responseSuccessful(res, 200, 'Clientes obtenidos exitosamente', clients);
  }
}
