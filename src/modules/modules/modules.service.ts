import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Modul } from './entities/module.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Modul)
    private readonly moduleRespository: Repository<Modul>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createModuleDto: CreateModuleDto) {
    try {
      const moduleExists = await this.findByName(createModuleDto.name);
      if (moduleExists !== null)
        throw new ConflictException('Ya existe un módulo con ese nombre. Por favor, elija otro');

      const newModule = this.moduleRespository.create(createModuleDto);
      const moduleSaved = await this.moduleRespository.save(newModule);

      const permissionsCreated = await this.permissionsService.create(moduleSaved.moduleId);
      return { ...moduleSaved, permissions_created: permissionsCreated.length };
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // 1. Obtener totales globales (sin paginación)
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_items,
            COUNT(*) FILTER(WHERE active = true) AS total_items_active,
            COUNT(*) FILTER(WHERE active = false) AS total_items_inactive
        FROM modules
    `;
    const totalsResult = await this.moduleRespository.query(totalsQuery);
    const totals = totalsResult[0] || { total_items: 0, total_items_active: 0, total_items_inactive: 0 };

    // 2. Obtener datos paginados con filtros
    const parameters: any[] = [limit, offset, active];
    let dataQuery = `
        SELECT 
            m."moduleId",
            m.name,
            m.active,
            m."createdAt"
        FROM modules m
        WHERE m.active = $3
        ORDER BY m."moduleId" ASC
        LIMIT $1 OFFSET $2
    `;

    // Si param existe, agregar condición de búsqueda por name
    if (param && param.trim() !== '') {
      dataQuery += ` AND (m.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const result = await this.moduleRespository.query(dataQuery, parameters);

    const modules = result.map((row) => ({
      moduleId: row.moduleId,
      name: row.name,
      active: row.active,
      createdAt: row.createdAt,
    }));

    return {
      data: modules,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(totals.total_items_active) || 0) / limit)
          : Math.ceil((parseInt(totals.total_items_inactive) || 0) / limit),
        totals: {
          general: parseInt(totals.total_items) || 0,
          active: parseInt(totals.total_items_active) || 0,
          inactive: parseInt(totals.total_items_inactive) || 0,
        },
      },
    };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    try {
      // Verficar existencia del módulo
      const moduleExists = await this.findById(id);
      if (!moduleExists) throw new NotFoundException('No se encontró el módulo con el id proporcionado');
      if (!moduleExists.active) throw new ConflictException('El módulo está inactivo. No puede ser actualizado');

      // Verficar que el nombre no exista en la DB
      const moduleWithSameName = await this.findByName(updateModuleDto.name as string);
      if (moduleWithSameName !== null)
        throw new ConflictException('Ya existe un módulo con ese nombre. Por favor, elija otro');

      return await this.moduleRespository.update(id, { ...updateModuleDto, updatedAt: new Date() });
    } catch (error) {
      throw error;
    }
  }

  async restore(id: number) {
    try {
      const moduleExists = await this.findById(id);
      if (!moduleExists) throw new NotFoundException('No existe un módulo con el id proporcionado');
      if (moduleExists.active) throw new ConflictException('El módulo está activo. No puede ser restaurado');

      return await this.moduleRespository.update(id, { active: true, deletedAt: null });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const moduleExists = await this.findById(id);
      if (!moduleExists) throw new NotFoundException('No existe un módulo con el id proporcionado');
      if (!moduleExists.active) throw new ConflictException('El módulo está inactivo. No puede ser eliminado');

      moduleExists.active = false;
      moduleExists.deletedAt = new Date();
      return await this.moduleRespository.save(moduleExists);
    } catch (error) {
      throw error;
    }
  }

  async findByName(name: string) {
    try {
      return await this.moduleRespository.findOne({
        where: { name },
        select: ['moduleId', 'name', 'active'],
        order: { moduleId: 'ASC' },
        withDeleted: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.moduleRespository.findOne({
        where: { moduleId: id },
        select: ['moduleId', 'name', 'active'],
        withDeleted: true,
      });
    } catch (error) {
      throw error;
    }
  }
}
