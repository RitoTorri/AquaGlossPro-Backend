import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe, Query, HttpCode } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import clientsSwagger from './clients.swagger';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @clientsSwagger.createClient()
  @HttpCode(201)
  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return { message: 'Cliente creado exitosamente', data: client };
  }

  @clientsSwagger.deleteClient()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.clientsService.remove(+id);
    return;
  }

  @clientsSwagger.updateClient()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    await this.clientsService.update(+id, updateClientDto);
    return;
  }

  @clientsSwagger.restoreClient()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.clientsService.restore(+id);
    return;
  }

  @clientsSwagger.findAllClients()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10, param } = paginationDto;
    const clients = await this.clientsService.findAll(active, page, limit, param || '');
    return { message: 'Clientes obtenidos exitosamente', data: clients };
  }
}
