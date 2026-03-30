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
    const user = await this.usersService.create(createUserDto);
    return { message: 'Usuario creado exitosamente', data: user };
  }

  @Docs.findAllUsers()
  //@UseGuards(VerifyTokenGuard)
  @Get()
  @HttpCode(200)
  async findAll(@Query() paginationDto: PaginationDto) {
    const { active, page = 1, limit = 10, param = '' } = paginationDto;
    const users = await this.usersService.findAll(active, page, limit, param);
    if (users.data.length === 0) throw new Error('No hay usuarios registrados');
    return { message: 'Listado de usuarios exitoso', data: users };
  }

  @Docs.updateUser()
  //@UseGuards(VerifyTokenGuard)
  @Patch(':id')
  @HttpCode(204)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(+id, updateUserDto);
    return;
  }

  @Docs.restoreUser()
  //@UseGuards(VerifyTokenGuard)
  @Patch('restore/:id')
  @HttpCode(204)
  async restore(@Param('id', ParseIntPipe) id: string) {
    await this.usersService.restore(+id);
    return;
  }

  @Docs.deleteUser()
  //@UseGuards(VerifyTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.usersService.remove(+id);
    return;
  }
}
