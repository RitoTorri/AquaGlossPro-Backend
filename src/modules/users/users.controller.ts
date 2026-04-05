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
  HttpException,
  InternalServerErrorException,
  // UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
// import { VerifyTokenGuard } from '../../shared/guards/verify-token.guard';
import Docs from './users.swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Docs.createUser()
  //@UseGuards(VerifyTokenGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return { message: 'Usuario creado exitosamente', data: user };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.findAllUsers()
  //@UseGuards(VerifyTokenGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const users = await this.usersService.findAll(paginationDto);
      return { message: 'Listado de usuarios exitoso', data: users };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.updateUser()
  //@UseGuards(VerifyTokenGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      await this.usersService.update(+id, updateUserDto);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.restoreUser()
  //@UseGuards(VerifyTokenGuard)
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.usersService.restore(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Docs.deleteUser()
  //@UseGuards(VerifyTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.usersService.remove(+id);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
