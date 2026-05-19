// src/modules/combos-services/combos-services.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombosServiceEntity } from './entities/combos-service.entity';
import { CreateCombosServiceDto } from './dto/create-combos-service.dto';
import { UpdateCombosServiceDto } from './dto/update-combos-service.dto';
import { CombosService } from '../combos/combos.service';
import { ServicesService } from '../services/services.service'; // ✅ Cambiado
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class CombosServicesService {
  constructor(
    @InjectRepository(CombosServiceEntity)
    private readonly repository: Repository<CombosServiceEntity>,
    private readonly combosService: CombosService,
    private readonly servicesService: ServicesService, // ✅ Cambiado
  ) {}

  async create(createDto: CreateCombosServiceDto) {
    await this.combosService.findOne(createDto.comboId);
    await this.servicesService.findById(createDto.serviceId); // ✅ Cambiado

    const existing = await this.repository.findOne({
      where: {
        comboId: createDto.comboId,
        serviceId: createDto.serviceId, // ✅ Cambiado
      },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException('Esta relación combo-servicio ya existe');
    }

    const entity = this.repository.create({
      comboId: createDto.comboId,
      serviceId: createDto.serviceId,
      active: createDto.active,
    });
    const saved = await this.repository.save(entity);
    return this.findOne(saved.comboServiceId);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, active } = paginationDto;
    const where = active !== undefined ? { active } : {};

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: ['combo', 'service'], // ✅ Cambiado
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
      relations: ['combo', 'service'],
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

    if (updateDto.comboId || updateDto.serviceId) {
      const newComboId = updateDto.comboId ?? entity.comboId;
      const newServiceId = updateDto.serviceId ?? entity.serviceId;

      const existing = await this.repository.findOne({
        where: {
          comboId: newComboId,
          serviceId: newServiceId,
        },
        withDeleted: true,
      });
      if (existing && existing.comboServiceId !== id) {
        throw new ConflictException('Esta relación combo-servicio ya existe');
      }

      if (updateDto.comboId) {
        await this.combosService.findOne(updateDto.comboId);
      }
      if (updateDto.serviceId) {
        await this.servicesService.findById(updateDto.serviceId);
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