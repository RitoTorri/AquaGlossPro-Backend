import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  Query,
  HttpCode,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
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
    try {
      const client = await this.clientsService.create(createClientDto);
      return { message: 'Cliente creado exitosamente', data: client };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @clientsSwagger.deleteClient()
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.clientsService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @clientsSwagger.updateClient()
  @HttpCode(204)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    try {
      await this.clientsService.update(+id, updateClientDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @clientsSwagger.restoreClient()
  @HttpCode(204)
  @Patch('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.clientsService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @clientsSwagger.findAllClients()
  @HttpCode(200)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const clients = await this.clientsService.findClients(paginationDto);
      return { message: 'Clientes obtenidos exitosamente', data: clients };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
