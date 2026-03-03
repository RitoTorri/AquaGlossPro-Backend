import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar existencia 
      const userExists = await this.findByEmail(createUserDto.email);
      if (userExists !== null) throw new Error('User already exists');

      const roleExists = await this.rolesService.findById(createUserDto.roleId);
      if (!roleExists) throw new Error('Role not found');
      if (!roleExists.active) throw new Error('Role is inactive');

      const passwordHash = await bcrypt.hash(createUserDto.password, 10);

      const newUser = this.userRepository.create({
        ...createUserDto,
        password: passwordHash
      });
      const userSaved = await this.userRepository.save(newUser);

      const { password, updatedAt, deletedAt, ...result } = userSaved;
      return result;
    } catch (error) { throw error; }
  }


  async findAll(active: boolean, page: number, limit: number) {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { active: active },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          userId: true,
          name: true,
          email: true,
          active: true,
          role: { roleId: true, name: true },
        },
        relations: ['role'],
        order: { userId: 'ASC' },
        withDeleted: true,
      });

      return {
        data: users,
        meta: {
          totalItems: total,
          itemCount: users.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) { throw error; }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const userExists = await this.findById(id);
      if (!userExists) throw new Error('User not found');
      if (!userExists.active) throw new Error('User is inactive');

      if (updateUserDto.email) {
        const emailExists = await this.findByEmail(updateUserDto.email);
        if (emailExists && emailExists.userId !== id) throw new Error('User already exists');
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updateUser = await this.userRepository.merge(userExists, updateUserDto);
      return await this.userRepository.save(updateUser);
    } catch (error) { throw error; }
  }


  async remove(id: number) {
    try {
      // Verficar existencia
      const userExists = await this.findById(id);
      if (!userExists) throw new Error('User not found');
      if (!userExists.active) throw new Error('User is already inactive');

      userExists.active = false;
      userExists.deletedAt = new Date();
      return await this.userRepository.save(userExists);
    } catch (error) { throw error; }
  }


  async restore(id: number) {
    try {
      // Verficar existencia
      const userExists = await this.findById(id);
      if (!userExists) throw new Error('User not found');
      if (userExists.active) throw new Error('User is already active');

      return await this.userRepository.update(id, { active: true, deletedAt: null });
    } catch (error) { throw error; }
  }


  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email: email },
        select: ['userId', 'name','email', 'roleId', 'password', 'active'],
        relations: ['role'],
        withDeleted: true,
      });
    } catch (error) { throw error; }
  }

  async findById(id: number) {
    try {
      return await this.userRepository.findOne({
        where: { userId: id },
        select: ['userId', 'name','email', 'roleId', 'password', 'active'],
        relations: ['role'],
        withDeleted: true,
      });
    } catch (error) { throw new error; }
  }
}