import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
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
    // Validar existencia del permiso + rol
    const existRolePermission = await this.findByRoleAndPermission(
      createRolePermissionDto.roleId,
      createRolePermissionDto.permissionId,
    );
    if (existRolePermission) throw new ConflictException('El rol ya tiene este permiso asignado');

    // Validar existencia de role y permiso
    const existRole = await this.rolesService.findById(createRolePermissionDto.roleId);
    if (!existRole) throw new NotFoundException('No existe un rol con el Id proporcionado');

    const existPermission = await this.permissionsService.findById(createRolePermissionDto.permissionId);
    if (!existPermission) throw new NotFoundException('No existe un permiso con el Id proporcionado');

    // Guardar en la base de datos
    const rolePermission = this.rolePermissionsRepository.create(createRolePermissionDto);
    return await this.rolePermissionsRepository.save(rolePermission);
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
      whereCondition += ` AND (r.name ILIKE $4 OR p."typePermission" ILIKE $4)`;
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

  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    const rolePermissionExists = await this.findById(id);
    if (!rolePermissionExists) throw new NotFoundException('No existe un RolPermission con el Id proporcionado');
    if (!rolePermissionExists.active)
      throw new ConflictException('RolPermission está inactivo. No puede ser actualizado');

    if (updateRolePermissionDto.permissionId) {
      const permissionExists = await this.permissionsService.findById(updateRolePermissionDto.permissionId);
      if (!permissionExists) throw new NotFoundException('No existe un permiso con el Id proporcionado');
      if (!permissionExists.active) throw new ConflictException('Permiso está inactivo. No puede ser asignado');
    }

    if (updateRolePermissionDto.roleId) {
      const roleExists = await this.rolesService.findById(updateRolePermissionDto.roleId);
      if (!roleExists) throw new NotFoundException('Rol no encontrado');
      if (!roleExists.active) throw new ConflictException('Rol está inactivo');
    }

    // Check if the new combination already exists
    if (updateRolePermissionDto.roleId && updateRolePermissionDto.permissionId) {
      const exist = await this.findByRoleAndPermission(
        updateRolePermissionDto.roleId,
        updateRolePermissionDto.permissionId,
      );
      if (exist && exist.rolePermissionId !== id) throw new ConflictException('El rol ya tiene este permiso asignado');
    }

    const updateRolePermission = await this.rolePermissionsRepository.merge(
      rolePermissionExists,
      updateRolePermissionDto,
    );
    return await this.rolePermissionsRepository.save(updateRolePermission);
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
