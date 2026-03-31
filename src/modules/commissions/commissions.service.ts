import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission } from './entities/commission.entity';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { EmployeesService } from '../employees/employees.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class CommissionsService {
    constructor(
        @InjectRepository(Commission)
        private readonly repository: Repository<Commission>,
        private readonly employeesService: EmployeesService,
    ) {}

    async create(createDto: CreateCommissionDto) {
        // Verificar existencia del empleado
        await this.employeesService.findOne(createDto.employeeId);

        // Opcional: verificar duplicado por saleDetailId
        const existing = await this.repository.findOne({
            where: { saleDetailId: createDto.saleDetailId },
            withDeleted: true,
        });
        if (existing) {
            throw new ConflictException('Ya existe una comisión para este detalle de venta');
        }

        const entity = this.repository.create(createDto);
        const saved = await this.repository.save(entity);
        return this.findOne(saved.commissionId);
    }

    async findAll(paginationDto: PaginationDto, search?: string) {
        const { limit = 10, page = 1, active } = paginationDto;
        const query = this.repository.createQueryBuilder('commission')
            .leftJoinAndSelect('commission.employee', 'employee')
            .where('commission.active = :active', { active: active !== undefined ? active : true });

        if (search) {
            query.andWhere(
                '(employee.names ILIKE :search OR employee.lastnames ILIKE :search OR employee.ci ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const [data, total] = await query
            .take(limit)
            .skip((page - 1) * limit)
            .orderBy('commission.commissionId', 'ASC')
            .getManyAndCount();

        return {
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }

    async findOne(id: number) {
        const entity = await this.repository.findOne({
            where: { commissionId: id },
            relations: ['employee'],
            withDeleted: true,
        });
        if (!entity) {
            throw new NotFoundException('Comisión no encontrada');
        }
        return entity;
    }

    async update(id: number, updateDto: UpdateCommissionDto) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La comisión está inactiva, no puede actualizarse');
        }
        if (updateDto.employeeId) {
            await this.employeesService.findOne(updateDto.employeeId);
        }
        Object.assign(entity, updateDto);
        const updated = await this.repository.save(entity);
        return this.findOne(updated.commissionId);
    }

    async updateStatus(id: number, statusDto: UpdateCommissionStatusDto) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La comisión está inactiva, no puede actualizarse');
        }
        entity.statusPaymentComission = statusDto.statusPaymentComission;
        const updated = await this.repository.save(entity);
        return this.findOne(updated.commissionId);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La comisión ya está inactiva');
        }
        entity.active = false;
        entity.deletedAt = new Date();
        await this.repository.save(entity);
        return { message: 'Comisión desactivada correctamente' };
    }

    async restore(id: number) {
        const entity = await this.findOne(id);
        if (entity.active) {
            throw new ConflictException('La comisión ya está activa');
        }
        entity.active = true;
        entity.deletedAt = null;
        await this.repository.save(entity);
        return { message: 'Comisión restaurada correctamente' };
    }
}