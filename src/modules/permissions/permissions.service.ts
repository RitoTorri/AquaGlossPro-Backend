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

    const globalTotals = await this.dataSource
      .getRepository(Permission)
      .createQueryBuilder('p')
      .select([
        'COUNT(*) FILTER(WHERE p.active = true) AS total_active',
        'COUNT(*) FILTER(WHERE p.active = false) AS total_inactive',
        'COUNT(*) AS total_general',
      ])
      .getRawOne();

    const query = this.dataSource
      .getRepository(Permission)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.modul', 'm')
      .select(['p.permissionId', 'p.typePermission', 'p.active', 'm.moduleId', 'm.name'])
      .where('p.active = :active', { active })
      .orderBy('p.permissionId', 'ASC');

    if (param && param.trim() !== '') {
      query.andWhere('(p.typePermission ILIKE :param OR m.name ILIKE :param)', { param: `%${param}%` });
    }

    const [permissions, filteredCount] = await query.take(limit).skip(offset).getManyAndCount();

    return {
      data: permissions,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalItemsFiltered: filteredCount,
        totalPages: Math.ceil(filteredCount / limit),
        totals: {
          general: parseInt(globalTotals.total_general) || 0,
          active: parseInt(globalTotals.total_active) || 0,
          inactive: parseInt(globalTotals.total_inactive) || 0,
        },
      },
    };
  }
}
