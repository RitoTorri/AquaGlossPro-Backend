import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login';
import { decodeToken, generateToken } from '../../shared/utils/tokens.utils';
import { RolePermission } from '../../modules/role_permissions/entities/role_permission.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly usersService: UsersService,
  ) { }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) throw new NotFoundException('No se encontró el usuario con ese correo electrónico');
      if (!user.active) throw new ConflictException('El usuario está inactivo. Por favor, contacte con el administrador');

      const passwordIsCorrect = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordIsCorrect) throw new BadRequestException('El usuario no existe o la contraseña es incorrecta');

      const permissions = await this.getUserPermissions(user.userId);

      // Token Acces
      const tokenAccessPayload = { userId: user.userId, roleId: user.roleId };
      const tokenAccess = generateToken(tokenAccessPayload, process.env.TOKEN_ACCESS || 'access_secret', '20m');

      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: { roleId: user.roleId, name: user.role.name },
        permissions: permissions,
        tokens: tokenAccess
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