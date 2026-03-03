import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from 'src/shared/utils/tokens.utils';

@Injectable()
export class VerifyRefreshTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      // Ahora sí funciona el await correctamente
      const payload = await verifyToken(token, process.env.TOKEN_ACCESS_REFRESH || 'refresh_secret');
      
      // Guardamos el payload Y el token crudo para usarlo después
      request['token-refresh'] = payload; 
      request['raw-refresh-token'] = token; // Guardamos el string original por si acaso
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }
      if (error.name === 'TokenExpiredError') {
        // Importante: Si expira en el REFRESH, lanzamos 401 para que el front mande al login
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Authentication failed');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}