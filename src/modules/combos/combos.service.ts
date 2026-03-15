import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Combo } from './entities/combo.entity';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';

@Injectable()
export class CombosService {
    constructor(
        @InjectRepository(Combo)
        private readonly combosRepository: Repository<Combo>,
    ) {}

    async create(createComboDto: CreateComboDto) {
        const existing = await this.findByName(createComboDto.name);
        if (existing) throw new ConflictException('Ya existe un combo con ese nombre');
        const combo = this.combosRepository.create(createComboDto);
        return this.combosRepository.save(combo);
    }

    async findAll(active: boolean, page: number, limit: number, param: string) {
        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };
        const [data, total] = await this.combosRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit,
            order: { comboId: 'ASC' },
            withDeleted: true,
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

    async findOne(id: number): Promise<Combo> {
        const combo = await this.combosRepository.findOne({
            where: { comboId: id },
            withDeleted: true,
        });
        if (!combo) throw new NotFoundException(`Combo con ID ${id} no encontrado`);
        return combo;
    }

    async update(id: number, updateComboDto: UpdateComboDto) {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo está inactivo');
        if (updateComboDto.name) {
            const existing = await this.findByName(updateComboDto.name);
            if (existing && existing.comboId !== id) {
                throw new ConflictException('Ya existe un combo con ese nombre');
            }
        }
        Object.assign(combo, updateComboDto);
        return this.combosRepository.save(combo);
    }

    async remove(id: number) {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo ya está inactivo');
        combo.active = false;
        combo.deletedAt = new Date();
        return this.combosRepository.save(combo);
    }

    async restore(id: number) {
        const combo = await this.findOne(id);
        if (combo.active) throw new ConflictException('El combo ya está activo');
        combo.active = true;
        combo.deletedAt = null;
        return this.combosRepository.save(combo);
    }

    async findByName(name: string): Promise<Combo | null> {
        return this.combosRepository.findOne({ where: { name }, withDeleted: true });
    }
}