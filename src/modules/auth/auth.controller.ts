import { Controller, Get, Post, Body, Res, Req, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import type { Response, Request } from 'express';
import responses from 'src/shared/utils/responses';
import { VerifyRefreshTokenGuard } from 'src/shared/guards/verify-refresh-token.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    try {
      const userLogin = await this.authService.login(loginDto);
      return responses.responseSuccessful(res, 200, "Usuario logueado de manera exitosa", userLogin);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'User not found':
          return responses.responsefailed(res, 404, "Usuario no encontrado");
        case 'User is inactive':
          return responses.responsefailed(res, 409, "Usuario inactivo");
        case 'Incorrect password':
          return responses.responsefailed(res, 401, "Contraseña incorrecta");
        case 'Already logged in from another device':
          return responses.responsefailed(res, 409, "Ya se ha iniciado sesión desde otro dispositivo. Cierre la sesión en el otro dispositivo para continuar");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }

  @Get('logout')
  async logout(@Res() res: Response, @Headers('authorization') authHeader: String) {
    try {
      // 1. Extraemos el token manualmente (porque quitamos el Guard)
      if (!authHeader) throw new Error('No token provided');
      const token: String = authHeader.split(' ')[1]; // Quitamos el "Bearer "

      // 2. Llamamos al servicio pasando el token crudo
      const logoutResult = await this.authService.logout(token as string);
      return logoutResult
        ? responses.responseSuccessful(res, 200, "Sesión cerrada correctamente")
        : responses.responsefailed(res, 400, "No tienes sesiones iniciadas");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'No active sessions found for this user') {
        return responses.responsefailed(res, 404, "No tiene sesiones iniciadas");
      }
      return responses.responsefailed(res, 500, errorMessage);
    }
  }

  @Get('refresh')
  @UseGuards(VerifyRefreshTokenGuard)
  async refreshToken(@Res() res: Response, @Req() req: Request) {
    try {
      // Obtenemos lo que el Guard ya procesó
      const payload = req['token-refresh'];
      const rawToken: any = req.headers.authorization!.split(' ')[1]; // El token físico

      // Pasamos el payload directamente
      const userRefresh = await this.authService.refreshToken(payload, rawToken);
      return responses.responseSuccessful(res, 200, "Token de refresco actualizado", userRefresh);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      switch (errorMessage) {
        case 'Refresh token not found':
          return responses.responsefailed(res, 404, "No se encontró el token de refresco");
        case 'User not found':
          return responses.responsefailed(res, 404, "Usuario no encontrado");
        default:
          return responses.responsefailed(res, 500, errorMessage);
      }
    }
  }
}