import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, ILike, LessThan } from 'typeorm';
import { Combo } from './entities/combo.entity';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { CombosServiceEntity } from '../combos-services/entities/combos-service.entity';
import { ServicesTypeVehicleService } from '../services-type-vehicle/services-type-vehicle.service';

@Injectable()
export class CombosService {
    constructor(
        @InjectRepository(Combo)
        private readonly combosRepository: Repository<Combo>,
        @InjectRepository(CombosServiceEntity)
        private readonly combosServicesRepository: Repository<CombosServiceEntity>,
        private readonly servicesTypeVehicleService: ServicesTypeVehicleService,
        private readonly dataSource: DataSource,
    ) {}

    // ==================== CREAR COMBO ====================
    async create(createComboDto: CreateComboDto): Promise<Combo> {
        // Validar nombre único
        const existing = await this.findByName(createComboDto.name);
        if (existing) throw new ConflictException('Ya existe un combo con ese nombre');

        // Validar fecha de expiración para promociones
        let expirationDateValue: Date | null = null;
        if (createComboDto.isPromotion) {
            if (!createComboDto.expirationDate) {
                throw new BadRequestException('La fecha de expiración es obligatoria para promociones');
            }
            const now = new Date();
            if (new Date(createComboDto.expirationDate) <= now) {
                throw new BadRequestException('La fecha de expiración debe ser mayor a la fecha actual');
            }
            expirationDateValue = createComboDto.expirationDate;
        }

        // Verificar que todos los servicios existan
        for (const stvId of createComboDto.servicesTypeVehicleIds) {
            await this.servicesTypeVehicleService.findOne(stvId);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Crear combo
            const combo = queryRunner.manager.create(Combo, {
                name: createComboDto.name,
                discountPercentage: createComboDto.discountPercentage,
                isPromotion: createComboDto.isPromotion ?? false,
                expirationDate: expirationDateValue,
            });
            const savedCombo = await queryRunner.manager.save(combo);

            // Guardar relaciones con servicios
            const combosServices = createComboDto.servicesTypeVehicleIds.map(stvId =>
                queryRunner.manager.create(CombosServiceEntity, {
                    comboId: savedCombo.comboId,
                    servicesTypeVehicleId: stvId,
                })
            );
            await queryRunner.manager.save(combosServices);

            await queryRunner.commitTransaction();
            return this.findOne(savedCombo.comboId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // ==================== LISTAR COMBOS ====================
    async findAll(active: boolean, page: number, limit: number, param: string): Promise<{ data: Combo[]; meta: any }> {
        await this.deactivateExpiredCombos();

        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };

        const [data, total] = await this.combosRepository.findAndCount({
            where,
            relations: [
                'combosServices',
                'combosServices.servicesTypeVehicle',
                'combosServices.servicesTypeVehicle.service',
                'combosServices.servicesTypeVehicle.typeVehicle',
            ],
            take: limit,
            skip: (page - 1) * limit,
            order: { comboId: 'ASC' },
            withDeleted: true,
        });

        const [activeCount, inactiveCount] = await Promise.all([
            this.combosRepository.count({ where: { active: true } }),
            this.combosRepository.count({ where: { active: false } }),
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

    // ==================== OBTENER UN COMBO ====================
    async findOne(id: number): Promise<Combo> {
        await this.deactivateExpiredCombos();
        const combo = await this.combosRepository.findOne({
            where: { comboId: id },
            relations: [
                'combosServices',
                'combosServices.servicesTypeVehicle',
                'combosServices.servicesTypeVehicle.service',
                'combosServices.servicesTypeVehicle.typeVehicle',
            ],
            withDeleted: true,
        });
        if (!combo) throw new NotFoundException(`Combo con ID ${id} no encontrado`);
        return combo;
    }

    // ==================== ACTUALIZAR COMBO ====================
    async update(id: number, updateComboDto: UpdateComboDto): Promise<Combo> {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo está inactivo');

        // Validar nombre único si cambia
        if (updateComboDto.name && updateComboDto.name !== combo.name) {
            const existing = await this.findByName(updateComboDto.name);
            if (existing) throw new ConflictException('Ya existe un combo con ese nombre');
        }

        // Validar promoción y fecha
        const isPromotion = updateComboDto.isPromotion ?? combo.isPromotion;
        let expirationDateValue: Date | null = combo.expirationDate;
        if (updateComboDto.expirationDate !== undefined) {
            expirationDateValue = updateComboDto.expirationDate;
        }

        if (isPromotion) {
            if (!expirationDateValue) {
                throw new BadRequestException('La fecha de expiración es obligatoria para promociones');
            }
            const now = new Date();
            if (new Date(expirationDateValue) <= now) {
                throw new BadRequestException('La fecha de expiración debe ser mayor a la fecha actual');
            }
        } else {
            expirationDateValue = null;
        }

        // Validar servicios si se envían
        if (updateComboDto.servicesTypeVehicleIds) {
            for (const stvId of updateComboDto.servicesTypeVehicleIds) {
                await this.servicesTypeVehicleService.findOne(stvId);
            }
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Actualizar datos del combo
            Object.assign(combo, updateComboDto);
            combo.expirationDate = expirationDateValue;
            const updatedCombo = await queryRunner.manager.save(combo);

            // Actualizar relaciones si se envió la lista de servicios
            if (updateComboDto.servicesTypeVehicleIds) {
                await queryRunner.manager.delete(CombosServiceEntity, { comboId: id });
                const newRelations = updateComboDto.servicesTypeVehicleIds.map(stvId =>
                    queryRunner.manager.create(CombosServiceEntity, {
                        comboId: id,
                        servicesTypeVehicleId: stvId,
                    })
                );
                await queryRunner.manager.save(newRelations);
            }

            await queryRunner.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // ==================== ELIMINAR (SOFT DELETE) ====================
    async remove(id: number): Promise<Combo> {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo ya está inactivo');
        combo.active = false;
        combo.deletedAt = new Date();
        return this.combosRepository.save(combo);
    }

    // ==================== RESTAURAR ====================
    async restore(id: number): Promise<Combo> {
        const combo = await this.findOne(id);
        if (combo.active) throw new ConflictException('El combo ya está activo');
        combo.active = true;
        combo.deletedAt = null;
        return this.combosRepository.save(combo);
    }

    // ==================== 🔥 DESACTIVAR COMBOS EXPIRADOS ====================
    async deactivateExpiredCombos(): Promise<void> {
        const now = new Date();
        const expiredCombos = await this.combosRepository.find({
            where: {
                active: true,
                isPromotion: true,
                expirationDate: LessThan(now),
            },
        });
        for (const combo of expiredCombos) {
            combo.active = false;
            await this.combosRepository.save(combo);
        }
    }

    // ==================== AUXILIARES ====================
    async findByName(name: string): Promise<Combo | null> {
        return this.combosRepository.findOne({ where: { name }, withDeleted: true });
    }
}