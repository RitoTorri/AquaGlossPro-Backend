import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '../utils/tokens.utils';

@Injectable()
export class VerifyTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    console.log(token);
    
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      // Ahora sí funciona el await correctamente
      const payload = await verifyToken(token, process.env.TOKEN_ACCESS || 'refresh_secret');
      request['user'] = { id_user: payload.userId, id_role: payload.roleId };
      // console.log(request['user']);
      
    } catch (error : any) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token con clave incorrecta');
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
    return type === 'Bearer' ? token.trim() : undefined;
  }
}