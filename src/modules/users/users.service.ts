import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, ILike } from 'typeorm';
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
    const userExists = await this.findByEmail(createUserDto.email);
    if (userExists !== null) throw new ConflictException('Ya existe un usuario con ese correo electrónico');

    const roleExists = await this.rolesService.findById(createUserDto.roleId);
    if (!roleExists) throw new NotFoundException('Rol no encontrado');
    if (!roleExists.active) throw new ConflictException('Rol está inactivo');

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: passwordHash
    });
    const userSaved = await this.userRepository.save(newUser);

    const { password, updatedAt, deletedAt, ...result } = userSaved;
    return result;
  }


  async findAll(active: boolean, page: number, limit: number, param: string | '') {
    const [users, total] = await this.userRepository.findAndCount({
      where: { active: active, name: ILike(`%${param?.toUpperCase()}%`) },
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
  }


  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.findById(id);
    if (!userExists) throw new NotFoundException('Usuario no encontrado');
    if (!userExists.active) throw new ConflictException('Usuario está inactivo');

    if (updateUserDto.email) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists && emailExists.userId !== id) throw new ConflictException('Ya existe un usuario con ese correo electrónico');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updateUser = await this.userRepository.merge(userExists, updateUserDto);
    return await this.userRepository.save(updateUser);
  }

  
  async remove(id: number) {
    const userExists = await this.findById(id);
    if (!userExists) throw new NotFoundException('Usuario no encontrado');
    if (!userExists.active) throw new ConflictException('Usuario está inactivo. No puede ser eliminado');

    userExists.active = false;
    userExists.deletedAt = new Date();
    return await this.userRepository.save(userExists);
  }

  async restore(id: number) {
    const userExists = await this.findById(id);
    if (!userExists) throw new NotFoundException('Usuario no encontrado');
    if (userExists.active) throw new ConflictException('Usuario está activo. No puede ser restaurado');

    return await this.userRepository.update(id, { active: true, deletedAt: null });
  }

  // Ayudadores de busqueda
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
      select: ['userId', 'name', 'email', 'roleId', 'password', 'active'],
      relations: ['role'],
      withDeleted: true,
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { userId: id },
      select: ['userId', 'name', 'email', 'roleId', 'password', 'active'],
      relations: ['role'],
      withDeleted: true,
    });
  }
}