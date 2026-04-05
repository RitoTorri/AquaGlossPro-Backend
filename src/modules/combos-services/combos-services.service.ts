import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombosServiceEntity } from './entities/combos-service.entity';
import { CreateCombosServiceDto } from './dto/create-combos-service.dto';
import { UpdateCombosServiceDto } from './dto/update-combos-service.dto';
import { CombosService } from '../combos/combos.service';
import { ServicesTypeVehicleService } from '../services-type-vehicle/services-type-vehicle.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class CombosServicesService {
    constructor(
        @InjectRepository(CombosServiceEntity)
        private readonly repository: Repository<CombosServiceEntity>,
        private readonly combosService: CombosService,
        private readonly servicesTypeVehicleService: ServicesTypeVehicleService,
    ) {}

    async create(createDto: CreateCombosServiceDto) {
        // Verificar existencia del combo
        await this.combosService.findOne(createDto.comboId);
        // Verificar existencia de la relación servicio-tipo vehículo
        await this.servicesTypeVehicleService.findOne(createDto.servicesTypeVehicleId);

        // Verificar duplicado
        const existing = await this.repository.findOne({
            where: {
                comboId: createDto.comboId,
                servicesTypeVehicleId: createDto.servicesTypeVehicleId,
            },
            withDeleted: true,
        });
        if (existing) {
            throw new ConflictException('Esta relación combo-servicio ya existe');
        }

        const entity = this.repository.create(createDto);
        const saved = await this.repository.save(entity);
        return this.findOne(saved.comboServiceId);
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, page = 1, active } = paginationDto;

        const where = active !== undefined ? { active } : {};

        const [data, total] = await this.repository.findAndCount({
            where,
            relations: ['combo', 'servicesTypeVehicle', 'servicesTypeVehicle.service', 'servicesTypeVehicle.typeVehicle'],
            take: limit,
            skip: (page - 1) * limit,
            order: { comboServiceId: 'ASC' },
        });

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
            where: { comboServiceId: id },
            relations: ['combo', 'servicesTypeVehicle', 'servicesTypeVehicle.service', 'servicesTypeVehicle.typeVehicle'],
            withDeleted: true,
        });
        if (!entity) {
            throw new NotFoundException('Relación combo-servicio no encontrada');
        }
        return entity;
    }

    async update(id: number, updateDto: UpdateCombosServiceDto) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La relación está inactiva, no puede actualizarse');
        }

        if (updateDto.comboId || updateDto.servicesTypeVehicleId) {
            const newComboId = updateDto.comboId ?? entity.comboId;
            const newStvId = updateDto.servicesTypeVehicleId ?? entity.servicesTypeVehicleId;

            // Verificar duplicado (excluyendo el actual)
            const existing = await this.repository.findOne({
                where: {
                    comboId: newComboId,
                    servicesTypeVehicleId: newStvId,
                },
                withDeleted: true,
            });
            if (existing && existing.comboServiceId !== id) {
                throw new ConflictException('Esta relación combo-servicio ya existe');
            }

            if (updateDto.comboId) {
                await this.combosService.findOne(updateDto.comboId);
            }
            if (updateDto.servicesTypeVehicleId) {
                await this.servicesTypeVehicleService.findOne(updateDto.servicesTypeVehicleId);
            }
        }

        Object.assign(entity, updateDto);
        const updated = await this.repository.save(entity);
        return this.findOne(updated.comboServiceId);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La relación ya está inactiva');
        }
        entity.active = false;
        entity.deletedAt = new Date();
        await this.repository.save(entity);
        return { message: 'Relación desactivada correctamente' };
    }

    async restore(id: number) {
        const entity = await this.findOne(id);
        if (entity.active) {
            throw new ConflictException('La relación ya está activa');
        }
        entity.active = true;
        entity.deletedAt = null;
        await this.repository.save(entity);
        return { message: 'Relación restaurada correctamente' };
    }
}