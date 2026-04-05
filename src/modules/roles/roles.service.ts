import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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

  async findAll(active: boolean = true): Promise<{ data: Role[]; totals: any }> {
    // 1. Obtener los roles
    const roles = await this.roleRepository.find({
      where: { active: active },
      select: ['roleId', 'name', 'active'],
      order: { roleId: 'ASC' },
      withDeleted: true,
    });

    // 2. Obtener totales globales
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
      data: roles,
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
