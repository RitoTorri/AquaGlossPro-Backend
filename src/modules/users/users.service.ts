import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, ILike } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import bcrypt from 'bcrypt';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);
    if (userExists !== null) throw new ConflictException('Ya existe un usuario con ese correo electrónico');

    const roleExists = await this.rolesService.findById(createUserDto.roleId);
    if (!roleExists) throw new NotFoundException('Rol no encontrado');
    if (!roleExists.active) throw new ConflictException('Rol está inactivo');

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
    });
    const userSaved = await this.userRepository.save(newUser);

    const { password, updatedAt, deletedAt, ...result } = userSaved;
    return result;
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
        FROM users
    `;
    const totalsResult = await this.userRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `u.active = $3`;

    // Si param existe, buscar en name
    if (param && param.trim() !== '') {
      whereCondition += ` AND (u.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            u."userId",
            u.name,
            u.email,
            u.active,
            json_build_object(
                'roleId', r."roleId",
                'name', r.name
            ) AS role
        FROM users u
        INNER JOIN roles r ON u."roleId" = r."roleId"
        WHERE ${whereCondition}
        ORDER BY u."userId" ASC
        LIMIT $1 OFFSET $2
    `;

    console.log('Parameters:', parameters);
    console.log('Query:', dataQuery);

    const result = await this.userRepository.query(dataQuery, parameters);

    const users = result.map((row) => ({
      userId: row.userId,
      name: row.name,
      email: row.email,
      active: row.active,
      role: row.role,
    }));

    return {
      data: users,
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.findById(id);
    if (!userExists) throw new NotFoundException('Usuario no encontrado');
    if (!userExists.active) throw new ConflictException('Usuario está inactivo');

    if (updateUserDto.email) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists && emailExists.userId !== id)
        throw new ConflictException('Ya existe un usuario con ese correo electrónico');
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
