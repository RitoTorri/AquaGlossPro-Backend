import { Controller, Get, Post, Body, Res, Req, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import type { Response, Request } from 'express';
import responses from '../../shared/utils/responses';
import { VerifyRefreshTokenGuard } from '../../shared/guards/verify-refresh-token.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({summary: 'Autenticación de usuario'})
  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    const userLogin = await this.authService.login(loginDto);
    return responses.responseSuccessful(res, 200, "Usuario logueado de manera exitosa", userLogin);
  }

  @ApiOperation({summary: 'Cierre de sesión'})
  @Get('logout')
  async logout(@Res() res: Response, @Headers('authorization') authHeader: String) {
    // 1. Extraemos el token manualmente (porque quitamos el Guard)
    if (!authHeader) throw new Error('No token provided');
    const token: String = authHeader.split(' ')[1]; // Quitamos el "Bearer "

    // 2. Llamamos al servicio pasando el token crudo
    const logoutResult = await this.authService.logout(token as string);
    return logoutResult
      ? responses.responseSuccessful(res, 200, "Sesión cerrada correctamente")
      : responses.responsefailed(res, 400, "No tienes sesiones iniciadas");
  }

  @ApiOperation({summary: 'Actualización de sesión'})
  @Get('refresh')
  @UseGuards(VerifyRefreshTokenGuard)
  async refreshToken(@Res() res: Response, @Req() req: Request) {
    // Obtenemos lo que el Guard ya procesó
    const payload = req['token-refresh'];
    const rawToken: any = req.headers.authorization!.split(' ')[1]; // El token físico

    // Pasamos el payload directamente
    const userRefresh = await this.authService.refreshToken(payload, rawToken);
    return responses.responseSuccessful(res, 200, "Token de refresco actualizado", userRefresh);
  }
}