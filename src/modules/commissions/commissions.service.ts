import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { StatusPayments } from '../../shared/enums/status-payments.enum';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(Commission)
    private readonly repository: Repository<Commission>,
  ) {}

  async findAll(paginationDto: PaginationDto, search?: string) {
    const { limit = 10, page = 1, param } = paginationDto;

    // 1. Crear query base
    const query = this.repository
      .createQueryBuilder('c')
      .select([
        'e."employeeId" AS "employeeId"',
        'e.names AS "names"',
        'e.lastnames AS "lastnames"',
        'e.ci AS "ci"',
        'SUM(c."conmissionTotal") AS "conmissionTotal"',
        'c."statusPaymentConmission" AS "statusPaymentConmission"',
        'COALESCE(c."paymentDate"::TEXT, \'none\') AS "paymentDate"',
      ])
      .innerJoin('c.servicesAssigments', 'sl')
      .innerJoin('sl.employee', 'e');

    const term = param || search;
    const statusPayments = [StatusPayments.PAID, StatusPayments.CANCELLED, StatusPayments.PENDING];

    if (term) {
      if (statusPayments.includes(term.toUpperCase() as StatusPayments)) {
        query.where('c."statusPaymentConmission"::TEXT ILIKE :term', { term: `%${term}%` });
      } else {
        query.where('(e.names ILIKE :term OR e.lastnames ILIKE :term OR e.ci ILIKE :term)', { term: `%${term}%` });
      }
    }

    query
      .groupBy('e."employeeId"')
      .addGroupBy('e.names')
      .addGroupBy('e.lastnames')
      .addGroupBy('e.ci')
      .addGroupBy('c."statusPaymentConmission"')
      .addGroupBy('c."paymentDate"');

    // 2. Clonar la query para contar (ANTES de aplicar paginación)
    const countQuery = query.clone();

    // 3. Obtener el total de resultados agrupados
    const totalResult = await countQuery.getRawMany();
    const total = totalResult.length;

    // 4. Paginación y ejecución de datos
    const data = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy('e.names', 'ASC')
      .getRawMany();

    // 5. Conteos globales de estatus
    const [paidCount, cancelledCount, pendingCount] = await Promise.all([
      this.repository.count({ where: { statusPaymentConmission: StatusPayments.PAID } }),
      this.repository.count({ where: { statusPaymentConmission: StatusPayments.CANCELLED } }),
      this.repository.count({ where: { statusPaymentConmission: StatusPayments.PENDING } }),
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        paidCount,
        cancelledCount,
        pendingCount,
      },
    };
  }

  async findOne(id: number) {
    const entity = await this.repository.findOne({
      where: { commissionId: id },
      relations: ['employee'],
      withDeleted: true,
    });
    if (!entity) throw new NotFoundException('Comisión no encontrada');
    return entity;
  }

  async updateStatus(employeeId: number, status: UpdateCommissionStatusDto) {
    return await this.repository.manager.transaction(async (transactionalEntityManager) => {
      // 1. Buscamos las comisiones del empleado que estén en estado 'W' (PENDING)
      // Usamos el query builder para entrar por la relación de services_assignments
      const commissionsToUpdate = await transactionalEntityManager
        .createQueryBuilder(Commission, 'c')
        .innerJoin('c.servicesAssigments', 'sl') // Asegúrate que el nombre coincida con tu entidad
        .where('sl.employeeId = :employeeId', { employeeId })
        .andWhere('c.statusPaymentConmission = :status', { status: 'W' })
        .getMany();

      // 2. Validación: Si no hay comisiones en 'W', no se puede proceder
      if (commissionsToUpdate.length === 0) {
        throw new NotFoundException(
          `El empleado con ID ${employeeId} no tiene comisiones pendientes (estado 'W') para pagar.`,
        );
      }

      // 3. Actualización masiva de las comisiones encontradas
      const ids = commissionsToUpdate.map((c) => c.commissionId);

      await transactionalEntityManager
        .createQueryBuilder()
        .update(Commission)
        .set({
          statusPaymentConmission: status.statusPaymentConmission, // O el estado al que desees cambiar
          paymentDate: new Date(),
          updatedAt: new Date(),
        })
        .whereInIds(ids)
        .execute();

      return {
        message: `Se han pagado ${ids.length} comisiones con éxito.`,
        updatedIds: ids,
      };
    });
  }
}
