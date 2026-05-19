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
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import { RolesGuard } from '../../shared/guards/permissions.guard';
import { CheckPermission } from '../../shared/decorators/permissions.decorators';
import clientsSwagger from './clients.swagger';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @clientsSwagger.createClient()
  @HttpCode(201)
  @CheckPermission('C', 'CLIENTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('D', 'CLIENTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('U', 'CLIENTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('U', 'CLIENTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
  @CheckPermission('R', 'CLIENTS')
  @UseGuards(VerifyTokenGuard, RolesGuard)
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
