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
  ) { }

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    // Validar existencia del permiso + rol
    const existRolePermission = await this.findByRoleAndPermission(createRolePermissionDto.roleId, createRolePermissionDto.permissionId);
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
    const [rolesPermissions, total] = await this.rolePermissionsRepository.findAndCount({
      where: { active: paginationDto.active },
      take: paginationDto.limit,
      skip: (paginationDto.page - 1) * paginationDto.limit,
      relations: {
        role: true,
        permission: {
          modul: true
        }
      },
      select: {
        rolePermissionId: true,
        active: true,
        role: {
          roleId: true,
          name: true,
          active: true,
        },
        permission: {
          permissionId: true,
          typePermission: true,
          active: true,
          modul: {moduleId: true, name: true}
        }
      },
      order: { rolePermissionId: 'ASC' },
      withDeleted: true,
    });

    return {
      data: rolesPermissions,
      meta: {
        totalItems: total,
        itemCount: rolesPermissions.length,
        itemsPerPage: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
        currentPage: paginationDto.page,
      },
    };
  }


  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    const rolePermissionExists = await this.findById(id);
    if (!rolePermissionExists) throw new NotFoundException('No existe un RolPermission con el Id proporcionado');
    if (!rolePermissionExists.active) throw new ConflictException('RolPermission está inactivo. No puede ser actualizado');

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
      const exist = await this.findByRoleAndPermission(updateRolePermissionDto.roleId, updateRolePermissionDto.permissionId);
      if (exist && exist.rolePermissionId !== id) throw new ConflictException('El rol ya tiene este permiso asignado');
    }

    const updateRolePermission = await this.rolePermissionsRepository.merge(rolePermissionExists, updateRolePermissionDto);
    return await this.rolePermissionsRepository.save(updateRolePermission);
  }


  async remove(id: number) {
    const rolePermissionExists = await this.findById(id);
    if (!rolePermissionExists) throw new NotFoundException('RolePermission no encontrado');
    if (!rolePermissionExists.active) throw new ConflictException('RolePermission está inactivo. No puede ser eliminado');

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
      where: { roleId: roleId, permissionId: permissionId }
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
