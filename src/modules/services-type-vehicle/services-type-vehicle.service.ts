import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesTypeVehicle } from './entities/services-type-vehicle.entity';
import { CreateServicesTypeVehicleDto } from './dto/create-services-type-vehicle.dto';
import { UpdateServicesTypeVehicleDto } from './dto/update-services-type-vehicle.dto';
import { ServicesService } from '../services/services.service';
import { TypeVehicleService } from '../type-vehicle/type-vehicle.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ServicesTypeVehicleService {
    constructor(
        @InjectRepository(ServicesTypeVehicle)
        private readonly repository: Repository<ServicesTypeVehicle>,
        private readonly servicesService: ServicesService,
        private readonly typeVehicleService: TypeVehicleService,
    ) {}

    async create(createDto: CreateServicesTypeVehicleDto) {
        // Verificar existencia
        await this.servicesService.findOne(createDto.serviceId);
        await this.typeVehicleService.findOne(createDto.typeVehicleId);

        // Verificar duplicado
        const existing = await this.repository.findOne({
            where: {
                serviceId: createDto.serviceId,
                typeVehicleId: createDto.typeVehicleId,
            },
            withDeleted: true,
        });
        if (existing) {
            throw new ConflictException('Ya existe una relación para ese servicio y tipo de vehículo');
        }

        const entity = this.repository.create(createDto);
        const saved = await this.repository.save(entity);
        return this.findOne(saved.serviceTypeVehicleId);
    }

    // 🔧 MÉTODO findAll SIMPLIFICADO (sin filtros complejos)
    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, page = 1 } = paginationDto;

        const [data, total] = await this.repository.findAndCount({
            relations: ['service', 'typeVehicle'],
            take: limit,
            skip: (page - 1) * limit,
            order: { serviceTypeVehicleId: 'ASC' },
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
            where: { serviceTypeVehicleId: id },
            relations: ['service', 'typeVehicle'],
            withDeleted: true,
        });
        if (!entity) {
            throw new NotFoundException('Relación no encontrada');
        }
        return entity;
    }

    async update(id: number, updateDto: UpdateServicesTypeVehicleDto) {
        const entity = await this.findOne(id);
        if (!entity.active) {
            throw new ConflictException('La relación está inactiva, no puede actualizarse');
        }

        if (updateDto.serviceId || updateDto.typeVehicleId) {
            const newServiceId = updateDto.serviceId ?? entity.serviceId;
            const newTypeVehicleId = updateDto.typeVehicleId ?? entity.typeVehicleId;

            const existing = await this.repository.findOne({
                where: {
                    serviceId: newServiceId,
                    typeVehicleId: newTypeVehicleId,
                },
                withDeleted: true,
            });
            if (existing && existing.serviceTypeVehicleId !== id) {
                throw new ConflictException('Ya existe una relación para ese servicio y tipo de vehículo');
            }

            if (updateDto.serviceId) {
                await this.servicesService.findOne(updateDto.serviceId);
            }
            if (updateDto.typeVehicleId) {
                await this.typeVehicleService.findOne(updateDto.typeVehicleId);
            }
        }

        Object.assign(entity, updateDto);
        const updated = await this.repository.save(entity);
        return this.findOne(updated.serviceTypeVehicleId);
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