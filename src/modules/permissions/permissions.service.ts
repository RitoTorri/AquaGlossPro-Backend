import { Injectable } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { DataSource } from 'typeorm';
import { actionsPermissions } from '../../shared/enums/actions.enums';
import { Modul } from '../../modules/modules/entities/module.entity';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class PermissionsService {
  constructor(private dataSource: DataSource) {}

  async create(moduleId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar existencia (Por si acaso XD)
      const moduleExists = await queryRunner.manager.findOne(Modul, { where: { moduleId: moduleId } });

      if (!moduleExists) throw new Error('Module not found');

      const actions = Object.values(actionsPermissions);

      const permissionsToCreate = actions.map((action) => {
        return queryRunner.manager.create(Permission, {
          moduleId: moduleId, // Usamos el ID recibido
          typePermission: action,
        });
      });

      // 3. Guardar todos los permisos de golpe
      const savedPermissions = await queryRunner.manager.save(Permission, permissionsToCreate);

      // 4. Confirmar la transacción
      await queryRunner.commitTransaction();
      return savedPermissions;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: number) {
    try {
      return await this.dataSource.getRepository(Permission).findOne({ where: { permissionId: id } });
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // 1. Obtener totales globales usando QueryBuilder
    const globalTotals = await this.dataSource
      .getRepository(Permission)
      .createQueryBuilder('p')
      .select([
        'COUNT(*) FILTER(WHERE p.active = true) AS total_active',
        'COUNT(*) FILTER(WHERE p.active = false) AS total_inactive',
        'COUNT(*) AS total_general',
      ])
      .getRawOne();

    // 2. Obtener datos paginados con filtros
    const query = this.dataSource
      .getRepository(Permission)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.modul', 'm')
      .select(['p.permissionId', 'p.typePermission', 'p.active', 'm.moduleId', 'm.name'])
      .where('p.active = :active', { active })
      .orderBy('p.permissionId', 'ASC')
      .take(limit)
      .skip(offset);

    // Si param existe, buscar en typePermission (puedes ajustar los campos)
    if (param && param.trim() !== '') {
      query.andWhere('p.typePermission ILIKE :param', { param: `%${param.toUpperCase()}%` });
    }

    const result = await query.getRawMany();

    // Mapear resultados manteniendo la estructura anidada de modul
    const permissions = result.map((row) => ({
      permissionId: row.p_permissionId,
      typePermission: row.p_typePermission,
      active: row.p_active,
      modul: {
        moduleId: row.m_moduleId,
        name: row.m_name,
      },
    }));

    return {
      data: permissions,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil((parseInt(globalTotals.total_general) || 0) / limit),
        totals: {
          general: parseInt(globalTotals.total_general) || 0,
          active: parseInt(globalTotals.total_active) || 0,
          inactive: parseInt(globalTotals.total_inactive) || 0,
        },
      },
    };
  }
}
