import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import type { Response } from 'express';
import { ApiAuth } from './auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiAuth()
  @HttpCode(200)
  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    const userLogin = await this.authService.login(loginDto);
    return { message: 'Usuario logueado de manera exitosa', data: userLogin };
  }
}
