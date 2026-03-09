import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import type { Response } from 'express';
import responses from '../../shared/utils/responses';
import { ApiOperation } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({summary: 'Autenticación de usuario'})
  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    const userLogin = await this.authService.login(loginDto);
    return responses.responseSuccessful(res, 200, "Usuario logueado de manera exitosa", userLogin);
  }
}