import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login';
import { decodeToken, generateToken } from 'src/shared/utils/tokens.utils';
import { RolePermission } from 'src/modules/role_permissions/entities/role_permission.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly usersService: UsersService,
  ) { }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) throw new Error('User not found');
      if (!user.active) throw new Error('User is inactive');

      const passwordIsCorrect = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordIsCorrect) throw new Error('Incorrect password');

      // Restricción de una sesión
      const existingSession = await this.refreshTokenRepository.findOne({
        where: { userId: user.userId },
      });
      if (existingSession) throw new Error('Already logged in from another device');

      const permissions = await this.getUserPermissions(user.userId);

      // Payloads
      const tokenAccessPayload = { userId: user.userId, roleId: user.roleId };
      const tokenRefreshPayload = { userId: user.userId };

      const tokenAccess = generateToken(tokenAccessPayload, process.env.TOKEN_ACCESS || 'access_secret', '20m');
      const tokenRefresh = generateToken(tokenRefreshPayload, process.env.TOKEN_ACCESS_REFRESH || 'refresh_secret', '7d');

      // Guardar en DB
      const refreshTokenEntity = this.refreshTokenRepository.create({
        userId: user.userId,
        token: tokenRefresh, // Idealmente aquí guardarías también fecha de expiración
      });
      await this.refreshTokenRepository.save(refreshTokenEntity);

      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: { roleId: user.roleId, name: user.role.name },
        permissions: permissions,
        tokens: { token_access: tokenAccess, token_refresh: tokenRefresh }
      };

    } catch (error) { throw error; }
  }


  async logout(token: string) {
    try {
      // 1. Usamos DECODE, no verify. Esto lee el token aunque haya expirado hace 100 años.
      const payload = decodeToken(token);

      // Si el token es basura y no se puede leer, no hacemos nada
      if (!payload || !payload.userId) return true;

      // 2. Borramos ESPECÍFICAMENTE ese token que contiene el refresh
      const tokenRefreshDeleted = await this.refreshTokenRepository.delete({ token: token });
      return tokenRefreshDeleted.affected !== 0 ? true : false;
    } catch (error) { throw error; }
  }


  async refreshToken(payload: any, sendToken: string) {
    try {
      const userId = payload.userId;

      // 1. BUSCAR EN LA DB: ¿Existe un registro para este usuario?
      const sessionInDb = await this.refreshTokenRepository.findOne({
        where: { userId: userId },
        select: ['token', 'userId'] // Traemos el token guardado para comparar
      });

      // 2. VALIDACIÓN CRUCIAL: 
      // Si no hay sesión en DB O el token enviado no coincide con el de la DB... ¡FUERA!
      if (!sessionInDb || sessionInDb.token !== sendToken) {
        throw new Error('Refresh token not found');
        // O 'Invalid session', esto evita que tokens viejos generen nuevos
      }

      // 3. Si llegamos aquí, el token es el correcto. 
      // Ahora buscamos al usuario para obtener su data fresca
      const user = await this.usersService.findById(userId);
      if (!user) throw new Error('User not found');

      // 4. ROTACIÓN: Borramos el viejo (el que acabamos de validar)
      await this.refreshTokenRepository.delete({ userId: userId });

      // 5. GENERAMOS LA NUEVA PAREJA
      const newAccessPayload = { userId: userId, roleId: user.roleId };
      const newRefreshPayload = { userId: userId };

      const tokenAccess = generateToken(newAccessPayload, process.env.TOKEN_ACCESS || 'access_secret', '20m');
      const tokenRefresh = generateToken(newRefreshPayload, process.env.TOKEN_ACCESS_REFRESH || 'refresh_secret', '7d');

      // 6. GUARDAMOS EL NUEVO
      const refreshTokenEntity = this.refreshTokenRepository.create({
        userId: userId,
        token: tokenRefresh,
      });
      await this.refreshTokenRepository.save(refreshTokenEntity);
      
      const permissions = await this.getUserPermissions(userId);
      return {
        userId: userId,
        name: user.name,
        email: user.email,
        role: { roleId: user.roleId, name: user.role.name },
        permissions: permissions,
        tokens: { token_access: tokenAccess, token_refresh: tokenRefresh }
      };

    } catch (error) { throw error; }
  }


  // La función de mapeo de permisos por modulos
  private async getUserPermissions(userId: number) {
    const permissions = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.role', 'role')
      .innerJoin('role.users', 'user')
      .innerJoin('rp.permission', 'permission')
      .innerJoin('permission.modul', 'module')
      .where('user.userId = :userId', { userId })
      .andWhere('rp.active = true')
      .andWhere('permission.active = true')
      .andWhere('module.active = true')
      .select([
        'module.name as name_module',
        'permission.typePermission as permission'
      ])
      .orderBy('module.name', 'ASC')
      .addOrderBy('permission.typePermission', 'ASC')
      .getRawMany();

    // Agrupar por módulo
    const permissionsByModule = {};

    permissions.forEach(p => {
      if (!permissionsByModule[p.name_module]) {
        permissionsByModule[p.name_module] = {
          name_module: p.name_module,
          permissions: []
        };
      }
      permissionsByModule[p.name_module].permissions.push(p.permission);
    });

    return Object.values(permissionsByModule);
  }
}