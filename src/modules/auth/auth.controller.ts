import { Controller, Post, Body, HttpException, HttpCode, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { ApiAuth } from './auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiAuth()
  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log(loginDto);
    try {
      const userLogin = await this.authService.login(loginDto);
      return { message: 'Usuario logueado de manera exitosa', data: userLogin };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
