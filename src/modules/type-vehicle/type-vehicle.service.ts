import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { TypeVehicle } from './entities/type-vehicle.entity';
import { CreateTypeVehicleDto } from './dto/create-type-vehicle.dto';
import { UpdateTypeVehicleDto } from './dto/update-type-vehicle.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class TypeVehicleService {
    constructor(
        @InjectRepository(TypeVehicle)
        private readonly typeVehicleRepository: Repository<TypeVehicle>,
    ) {}

    async create(createDto: CreateTypeVehicleDto) {
        const existing = await this.findByName(createDto.name);
        if (existing) throw new ConflictException('Ya existe un tipo de vehículo con ese nombre');
        const entity = this.typeVehicleRepository.create(createDto);
        return this.typeVehicleRepository.save(entity);
    }

    async findAll(paginationDto: PaginationDto) {
        const { active, page, limit, param } = paginationDto;
        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };
        const [data, total] = await this.typeVehicleRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit,
            order: { typeVehicleId: 'ASC' },
            withDeleted: true,
        });

        // Calcular conteos adicionales
        const activeCount = await this.typeVehicleRepository.count({ where: { active: true } });
        const inactiveCount = await this.typeVehicleRepository.count({ where: { active: false } });

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
        const entity = await this.typeVehicleRepository.findOne({
            where: { typeVehicleId: id },
            withDeleted: true,
        });
        if (!entity) throw new NotFoundException('Tipo de vehículo no encontrado');
        return entity;
    }

    async update(id: number, updateDto: UpdateTypeVehicleDto) {
        const entity = await this.findOne(id);
        if (!entity.active) throw new ConflictException('El tipo de vehículo está inactivo, no puede actualizarse');
        if (updateDto.name) {
            const existing = await this.findByName(updateDto.name);
            if (existing && existing.typeVehicleId !== id) {
                throw new ConflictException('Ya existe un tipo de vehículo con ese nombre');
            }
        }
        Object.assign(entity, updateDto);
        return this.typeVehicleRepository.save(entity);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (!entity.active) throw new ConflictException('El tipo de vehículo ya está inactivo');
        entity.active = false;
        entity.deletedAt = new Date();
        return this.typeVehicleRepository.save(entity);
    }

    async restore(id: number) {
        const entity = await this.findOne(id);
        if (entity.active) throw new ConflictException('El tipo de vehículo ya está activo');
        entity.active = true;
        entity.deletedAt = null;
        return this.typeVehicleRepository.save(entity);
    }

    async findByName(name: string) {
        return this.typeVehicleRepository.findOne({ where: { name }, withDeleted: true });
    }

    async findById(id: number) {
        return this.typeVehicleRepository.findOne({ where: { typeVehicleId: id }, withDeleted: true });
    }
}