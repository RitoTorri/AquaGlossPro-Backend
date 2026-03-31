/**
 * Este archivo lo que hacce es validar que el usuario tenga permisos para acceder a la ruta
 */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { PERMISSION_KEY } from '../decorators/permissions.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extraemos el decorador de permisos
    const requiredPermission = this.reflector.get<{
      action: string;
      name: string;
    }>(PERMISSION_KEY, context.getHandler());

    // Extraemos los datos del usuario de la request definida por el verify-token guard
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    //console.log('Request transformada desde el verify-token guard: ');
    //console.log(user);

    const roles: any = await this.authService.getUserPermissions(user.id_user);
    //console.log('Roles obtenidos por id del usuario: ');
    //console.log(roles);

    const hasAccess = roles.some(
      (role) =>
        role.name_module === requiredPermission.name &&
        role.permissions.includes(requiredPermission.action),
    );

    if (!hasAccess) throw new ForbiddenException('No tienes permisos para acceder a esta ruta de la API');
    return true;
  }
}
