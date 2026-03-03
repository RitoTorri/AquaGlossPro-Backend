import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async create(createRoleDto: RoleDto) {
    try {
      const roleExists = await this.findByName(createRoleDto.name);
      if (roleExists !== null) throw new Error('Role already exists');

      const newRole = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(newRole);
    } catch (error) { throw error; }
  }


  async findAll(active: boolean = true): Promise<Role[]> {
    try {
      return await this.roleRepository.find({
        where: { active: active },
        select: ['roleId', 'name', 'active'],
        order: { roleId: 'ASC' },
        withDeleted: true,
      });
    } catch (error) { throw error; }
  }


  async update(id: number, updateRoleDto: RoleDto) {
    try {
      let roleExists = await this.findById(id);
      if (!roleExists) throw new Error('Role not found');
      if (!roleExists.active) throw new Error('Role is inactive');

      roleExists = await this.findByName(updateRoleDto.name);
      if (roleExists !== null) throw new Error('Role already exists');

      const updatedRole = await this.roleRepository.update(id, { ...updateRoleDto, updatedAt: new Date() });
      return updatedRole;
    } catch (error) { throw error; }
  }


  async restore(id: number) {
    try {
      const roleExists = await this.findById(id);
      if (!roleExists) throw new Error('Role not found');
      if (roleExists.active) throw new Error('Role is active');

      return await this.roleRepository.update(id, { active: true, deletedAt: null });
    } catch (error) { throw error; }
  }


  async remove(id: number) {
    try {
      const roleExists = await this.findById(id);
      if (!roleExists) throw new Error('Role not found');
      if (!roleExists.active) throw new Error('Role is inactive');

      roleExists.active = false;
      roleExists.deletedAt = new Date();
      return await this.roleRepository.save(roleExists);
    } catch (error) { throw error; }
  }


  async findByName(name: string) {
    try {
      return await this.roleRepository.findOne({
        where: { name: name },
        select: ['roleId', 'name', 'active'],
        order: { roleId: 'ASC' },
        withDeleted: true,
      });
    } catch (error) { throw error; }
  }


  async findById(id: number) {
    try {
      return await this.roleRepository.findOne({
        where: { roleId: id },
        select: ['roleId', 'name', 'active'],
        withDeleted: true,
      });
    } catch (error) { throw error; }
  }
}
