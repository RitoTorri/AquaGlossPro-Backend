import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role_permission.dto';
import { RolePermission } from './entities/role_permission.entity';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) { }

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    try {
      // Validar existencia del permiso + rol
      const existRolePermission = await this.findByRoleAndPermission(createRolePermissionDto.roleId, createRolePermissionDto.permissionId);
      if (existRolePermission) throw new Error('Role already has this permission');

      // Validar existencia de role y permiso
      const existRole = await this.rolesService.findById(createRolePermissionDto.roleId);
      if (!existRole) throw new Error('Role not found');

      const existPermission = await this.permissionsService.findById(createRolePermissionDto.permissionId);
      if (!existPermission) throw new Error('Permission not found');

      // Guardar en la base de datos
      const rolePermission = this.rolePermissionsRepository.create(createRolePermissionDto);
      return await this.rolePermissionsRepository.save(rolePermission);
    } catch (error) { throw error; }
  }


  async findAll(paginationDto: PaginationDto) {
    try {
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
    } catch (error) { throw error; }
  }


  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    try {
      const rolePermissionExists = await this.findById(id);
      if (!rolePermissionExists) throw new Error('RolePermission not found');
      if (!rolePermissionExists.active) throw new Error('RolePermission is inactive');
  
      // AQUÍ ESTABA EL ERROR: Usar la 'u' minúscula
      if (updateRolePermissionDto.permissionId) { 
        const permissionExists = await this.permissionsService.findById(updateRolePermissionDto.permissionId);
        if (!permissionExists) throw new Error('Permission not found');
        if (!permissionExists.active) throw new Error('Permission is inactive');
      }
  
      // AQUÍ TAMBIÉN: Usar la 'u' minúscula
      if (updateRolePermissionDto.roleId) {
        const roleExists = await this.rolesService.findById(updateRolePermissionDto.roleId);
        if (!roleExists) throw new Error('Role not found');
        if (!roleExists.active) throw new Error('Role is inactive');
      }
  
      const updateRolePermission = await this.rolePermissionsRepository.merge(rolePermissionExists, updateRolePermissionDto);
      return await this.rolePermissionsRepository.save(updateRolePermission);
    } catch (error) { throw error; }
  }


  async remove(id: number) {
    try {
      const rolePermissionExists = await this.findById(id);
      if (!rolePermissionExists) throw new Error('RolePermission not found');
      if (!rolePermissionExists.active) throw new Error('RolePermission is inactive');

      rolePermissionExists.active = false;
      rolePermissionExists.deletedAt = new Date();
      return await this.rolePermissionsRepository.save(rolePermissionExists);
    } catch (error) { throw error; }
  }


  async restore(id: number) {
    try {
      const rolePermissionExists = await this.findById(id);
      if (!rolePermissionExists) throw new Error('RolePermission not found');
      if (rolePermissionExists.active) throw new Error('RolePermission is active');

      return await this.rolePermissionsRepository.update(id, { active: true, deletedAt: null });
    } catch (error) { throw error; }
  }


  async findByRoleAndPermission(roleId: number, permissionId: number) {
    try {
      return await this.rolePermissionsRepository.findOne({
        where: { roleId: roleId, permissionId: permissionId }
      });
    } catch (error) { throw error; }
  }

  
  async findById(id: number) {
    try {
      return await this.rolePermissionsRepository.findOne({
        where: { rolePermissionId: id },
        select: ['rolePermissionId', 'roleId', 'permissionId', 'active'],
        withDeleted: true,
      });
    } catch (error) { throw error; }
  }
}
