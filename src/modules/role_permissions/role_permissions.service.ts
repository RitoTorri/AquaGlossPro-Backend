import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { RolePermission } from './entities/role_permission.entity';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    const { roleId, permissions } = createRolePermissionDto;

    // 1. Validar existencia del rol una sola vez
    const existRole = await this.rolesService.findById(roleId);
    if (!existRole) throw new NotFoundException(`No existe un rol con el Id ${roleId}`);

    // 2. Validar permisos (Usamos for...of o Promise.all para que realmente espere)
    for (const permissionId of permissions) {
      // Validar si el permiso existe y está activo
      const existPermission = await this.permissionsService.findById(permissionId);
      if (!existPermission) {
        throw new NotFoundException(`No existe un permiso con el Id ${permissionId}`);
      }
      if (!existPermission.active) {
        throw new ConflictException(`El permiso ${permissionId} está inactivo`);
      }

      // Validar si ya existe la relación para evitar duplicados
      const existRolePermission = await this.findByRoleAndPermission(roleId, permissionId);
      if (existRolePermission) {
        throw new ConflictException(`El rol ya tiene el permiso ${permissionId} asignado`);
      }
    }

    // 3. Crear los registros para la tabla intermedia
    // Mapeamos el array de IDs a objetos de la entidad RolePermission
    const newRolePermissions = permissions.map((permissionId) => {
      return this.rolePermissionsRepository.create({
        roleId: roleId,
        permissionId: permissionId,
      });
    });

    // 4. Guardar todos de golpe (Bulk insert)
    return await this.rolePermissionsRepository.save(newRolePermissions);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // Asegurar tipos correctos
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const activeBool = active === true || active === 'true';

    // 1. Obtener totales globales
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_general,
            COUNT(*) FILTER(WHERE active = true) AS total_active,
            COUNT(*) FILTER(WHERE active = false) AS total_inactive
        FROM roles_permissions
    `;
    const totalsResult = await this.rolePermissionsRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `rp.active = $3`;

    // Si param existe, buscar en role.name o permission.typePermission
    if (param && param.trim() !== '') {
      whereCondition += ` AND (r.name LIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            rp."rolePermissionId",
            rp.active AS rp_active,
            json_build_object(
                'roleId', r."roleId",
                'name', r.name,
                'active', r.active
            ) AS role,
            json_build_object(
                'permissionId', p."permissionId",
                'typePermission', p."typePermission",
                'active', p.active,
                'modul', json_build_object(
                    'moduleId', m."moduleId",
                    'name', m.name
                )
            ) AS permission
        FROM roles_permissions rp
        INNER JOIN roles r ON rp."roleId" = r."roleId"
        INNER JOIN permissions p ON rp."permissionId" = p."permissionId"
        LEFT JOIN modules m ON p."moduleId" = m."moduleId"
        WHERE ${whereCondition}
        ORDER BY rp."rolePermissionId" ASC
        LIMIT $1 OFFSET $2
    `;

    // console.log('Parameters:', parameters);
    // console.log('Query:', dataQuery);

    const result = await this.rolePermissionsRepository.query(dataQuery, parameters);

    const rolesPermissions = result.map((row) => ({
      rolePermissionId: row.rolePermissionId,
      active: row.rp_active,
      role: row.role,
      permission: row.permission,
    }));

    return {
      data: rolesPermissions,
      meta: {
        itemPerPage: limitNum,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(globalTotals.total_active) || 0) / limitNum)
          : Math.ceil((parseInt(globalTotals.total_inactive) || 0) / limitNum),
        totals: {
          general: parseInt(globalTotals.total_general) || 0,
          active: parseInt(globalTotals.total_active) || 0,
          inactive: parseInt(globalTotals.total_inactive) || 0,
        },
      },
    };
  }

  async remove(id: number) {
    const rolePermissionExists = await this.findById(id);
    if (!rolePermissionExists) throw new NotFoundException('RolePermission no encontrado');
    if (!rolePermissionExists.active)
      throw new ConflictException('RolePermission está inactivo. No puede ser eliminado');

    rolePermissionExists.active = false;
    rolePermissionExists.deletedAt = new Date();
    return await this.rolePermissionsRepository.save(rolePermissionExists);
  }

  async restore(id: number) {
    const rolePermissionExists = await this.findById(id);
    if (!rolePermissionExists) throw new NotFoundException('RolePermission no encontrado');
    if (rolePermissionExists.active) throw new ConflictException('RolePermission está activo. No puede ser restaurado');

    return await this.rolePermissionsRepository.update(id, { active: true, deletedAt: null });
  }

  async findByRoleAndPermission(roleId: number, permissionId: number) {
    return await this.rolePermissionsRepository.findOne({
      where: { roleId: roleId, permissionId: permissionId },
    });
  }

  async findById(id: number) {
    return await this.rolePermissionsRepository.findOne({
      where: { rolePermissionId: id },
      select: ['rolePermissionId', 'roleId', 'permissionId', 'active'],
      withDeleted: true,
    });
  }
}
