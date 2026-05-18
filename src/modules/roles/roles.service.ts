import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const roleExists = await this.findByName(createRoleDto.name);
    if (roleExists !== null) throw new ConflictException('Ya existe un rol con ese nombre');

    const newRole = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(newRole);
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: any[]; totals: any }> {
    const whereConditions: any = {
      active: paginationDto.active,
    };

    // 2. Si existe el parámetro de búsqueda, lo agregamos al MISMO objeto (AND)
    if (paginationDto.param) {
      whereConditions.name = ILike(`%${paginationDto.param}%`);
    }

    // 1. Obtener los roles con sus relaciones
    const roles = await this.roleRepository.find({
      where: whereConditions,
      order: { roleId: 'ASC' },
      relations: {
        rolesPermissions: {
          permission: {
            modul: true,
          },
        },
      },
      take: paginationDto.limit,
      skip: paginationDto.page - 1,
      withDeleted: true,
    });

    // 2. Transformar la estructura para agrupar por módulo
    const formattedRoles = roles.map((role) => {
      const modulesMap = new Map();

      role.rolesPermissions.forEach((rp) => {
        const moduleName = rp.permission.modul.name;
        const moduleId = rp.permission.modul.moduleId;

        if (!modulesMap.has(moduleId)) {
          modulesMap.set(moduleId, {
            moduleId: moduleId,
            moduleName: moduleName,
            permissions: [],
          });
        }

        // Agregamos el permiso actual al módulo correspondiente
        modulesMap.get(moduleId).permissions.push({
          permissionId: rp.permission.permissionId,
          type: rp.permission.typePermission, // C, R, U, D
          active: rp.active,
        });
      });

      return {
        roleId: role.roleId,
        name: role.name,
        active: role.active,
        // Convertimos el Map a un Array para el JSON final
        modules: Array.from(modulesMap.values()),
      };
    });

    // 3. Obtener totales globales (Tu lógica de SQL se mantiene igual)
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_general,
            COUNT(*) FILTER(WHERE active = true) AS total_active,
            COUNT(*) FILTER(WHERE active = false) AS total_inactive
        FROM roles
    `;
    const totalsResult = await this.roleRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    return {
      data: formattedRoles,
      totals: {
        general: parseInt(globalTotals.total_general) || 0,
        active: parseInt(globalTotals.total_active) || 0,
        inactive: parseInt(globalTotals.total_inactive) || 0,
      },
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const roleExists = await this.findById(id);
    if (!roleExists) throw new NotFoundException('Rol no encontrado');
    if (!roleExists.active) throw new ConflictException('Rol está inactivo');

    if (updateRoleDto.name) {
      const roleWithSameName = await this.findByName(updateRoleDto.name);
      if (roleWithSameName !== null && roleWithSameName.roleId !== id)
        throw new ConflictException('Ya existe un rol con ese nombre');
    }

    const updateRole = await this.roleRepository.merge(roleExists, updateRoleDto);
    return await this.roleRepository.save(updateRole);
  }

  async restore(id: number) {
    const roleExists = await this.findById(id);
    if (!roleExists) throw new NotFoundException('Rol no encontrado');
    if (roleExists.active) throw new ConflictException('Rol está activo. No puede ser restaurado');

    return await this.roleRepository.update(id, { active: true, deletedAt: null });
  }

  async remove(id: number) {
    const roleExists = await this.findById(id);
    if (!roleExists) throw new NotFoundException('Rol no encontrado');
    if (!roleExists.active) throw new ConflictException('Rol está inactivo. No puede ser eliminado');

    roleExists.active = false;
    roleExists.deletedAt = new Date();
    return await this.roleRepository.save(roleExists);
  }

  // Ayudadores de busqueda
  async findByName(name: string) {
    return await this.roleRepository.findOne({
      where: { name: name },
      select: ['roleId', 'name', 'active'],
      order: { roleId: 'ASC' },
      withDeleted: true,
    });
  }

  async findById(id: number) {
    return await this.roleRepository.findOne({
      where: { roleId: id },
      select: ['roleId', 'name', 'active'],
      withDeleted: true,
    });
  }
}
