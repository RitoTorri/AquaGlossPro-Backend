import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(Commission)
    private readonly repository: Repository<Commission>,
  ) {}

  async findAll(paginationDto: PaginationDto, search?: string) {
    const { limit = 10, page = 1, active } = paginationDto;
    const query = this.repository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.employee', 'employee')
      .where('commission.active = :active', { active: active !== undefined ? active : true });

    if (search) {
      query.andWhere(
        '(employee.names ILIKE :search OR employee.lastnames ILIKE :search OR employee.ci ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('commission.commissionId', 'ASC')
      .getManyAndCount();

    // Calcular conteos adicionales
    const [activeCount, inactiveCount] = await Promise.all([
      this.repository.count({ where: { active: true } }),
      this.repository.count({ where: { active: false } }),
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        activeCount,
        inactiveCount,
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

  async updateStatus(id: number, statusDto: UpdateCommissionStatusDto) {
    const entity = await this.findOne(id);
    if (!entity.active) throw new ConflictException('La comisión está inactiva');
    entity.statusPaymentComission = statusDto.statusPaymentComission;
    const updated = await this.repository.save(entity);
    return this.findOne(updated.commissionId);
  }
}
