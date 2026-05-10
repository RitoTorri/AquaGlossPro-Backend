<<<<<<< HEAD
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThan } from 'typeorm';
=======
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, ILike } from 'typeorm';
>>>>>>> master
import { Combo } from './entities/combo.entity';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { CombosServiceEntity } from '../combos-services/entities/combos-service.entity';
import { ServicesTypeVehicleService } from '../services-type-vehicle/services-type-vehicle.service';

@Injectable()
export class CombosService {
<<<<<<< HEAD
    constructor(
        @InjectRepository(Combo)
        private readonly combosRepository: Repository<Combo>,
        @InjectRepository(CombosServiceEntity)
        private readonly combosServicesRepository: Repository<CombosServiceEntity>,
        private readonly servicesTypeVehicleService: ServicesTypeVehicleService,
    ) {}

    async create(createComboDto: CreateComboDto): Promise<Combo> {
        const existing = await this.findByName(createComboDto.name);
        if (existing) throw new ConflictException('Ya existe un combo con ese nombre');

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

        const combo = this.combosRepository.create({
            name: createComboDto.name,
            discountPercentage: createComboDto.discountPercentage,
            isPromotion: createComboDto.isPromotion ?? false,
            expirationDate: expirationDateValue,  // ✅ null o Date
        });
        const savedCombo = await this.combosRepository.save(combo);

        // Guardar relaciones con servicios
        const combosServices = createComboDto.servicesTypeVehicleIds.map(stvId =>
            this.combosServicesRepository.create({
                comboId: savedCombo.comboId,
                servicesTypeVehicleId: stvId,
            })
        );
        await this.combosServicesRepository.save(combosServices);

        return this.findOne(savedCombo.comboId);
    }

    async findAll(active: boolean, page: number, limit: number, param: string): Promise<{ data: Combo[]; meta: any }> {
        await this.deactivateExpiredCombos();

        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };

        const [data, total] = await this.combosRepository.findAndCount({
            where,
            relations: ['combosServices', 'combosServices.servicesTypeVehicle', 'combosServices.servicesTypeVehicle.service', 'combosServices.servicesTypeVehicle.typeVehicle'],
            take: limit,
            skip: (page - 1) * limit,
            order: { comboId: 'ASC' },
            withDeleted: true,
        });

        const activeCount = await this.combosRepository.count({ where: { active: true } });
        const inactiveCount = await this.combosRepository.count({ where: { active: false } });

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

    async findOne(id: number): Promise<Combo> {
        await this.deactivateExpiredCombos();
        const combo = await this.combosRepository.findOne({
            where: { comboId: id },
            relations: ['combosServices', 'combosServices.servicesTypeVehicle', 'combosServices.servicesTypeVehicle.service', 'combosServices.servicesTypeVehicle.typeVehicle'],
            withDeleted: true,
        });
        if (!combo) throw new NotFoundException(`Combo con ID ${id} no encontrado`);
        return combo;
    }

    async update(id: number, updateComboDto: UpdateComboDto): Promise<Combo> {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo está inactivo');

        if (updateComboDto.name && updateComboDto.name !== combo.name) {
            const existing = await this.findByName(updateComboDto.name);
            if (existing) throw new ConflictException('Ya existe un combo con ese nombre');
        }

        const isPromotion = updateComboDto.isPromotion !== undefined ? updateComboDto.isPromotion : combo.isPromotion;
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

        Object.assign(combo, updateComboDto);
        combo.expirationDate = expirationDateValue;
        const updatedCombo = await this.combosRepository.save(combo);

        if (updateComboDto.servicesTypeVehicleIds) {
            await this.combosServicesRepository.delete({ comboId: id });
            const newRelations = updateComboDto.servicesTypeVehicleIds.map(stvId =>
                this.combosServicesRepository.create({
                    comboId: id,
                    servicesTypeVehicleId: stvId,
                })
            );
            await this.combosServicesRepository.save(newRelations);
        }

        return this.findOne(id);
    }

    async remove(id: number): Promise<Combo> {
        const combo = await this.findOne(id);
        if (!combo.active) throw new ConflictException('El combo ya está inactivo');
        combo.active = false;
        combo.deletedAt = new Date();
        return this.combosRepository.save(combo);
    }

    async restore(id: number): Promise<Combo> {
        const combo = await this.findOne(id);
        if (combo.active) throw new ConflictException('El combo ya está activo');
        combo.active = true;
        combo.deletedAt = null;
        return this.combosRepository.save(combo);
    }

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

    async findByName(name: string): Promise<Combo | null> {
        return this.combosRepository.findOne({ where: { name }, withDeleted: true });
    }
=======
  constructor(
    @InjectRepository(Combo)
    private readonly combosRepository: Repository<Combo>,
    @InjectRepository(CombosServiceEntity)
    private readonly combosServicesRepository: Repository<CombosServiceEntity>,
    private readonly servicesTypeVehicleService: ServicesTypeVehicleService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createComboDto: CreateComboDto) {
    // 1. Verificar nombre único
    const existing = await this.findByName(createComboDto.name);
    if (existing) throw new ConflictException('Ya existe un combo con ese nombre');

    // 2. Verificar que todos los servicios existan y estén activos
    for (const stvId of createComboDto.servicesTypeVehicleIds) {
      await this.servicesTypeVehicleService.findOne(stvId);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Crear combo
      const combo = queryRunner.manager.create(Combo, {
        name: createComboDto.name,
        discountPercentage: createComboDto.discountPercentage,
        isPromotion: createComboDto.isPromotion ?? false,
        expirationDate: createComboDto.expirationDate,
      });
      const savedCombo = await queryRunner.manager.save(combo);

      // 4. Insertar relaciones en combos_services
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

  async findAll(active: boolean, page: number, limit: number, param: string) {
    const where = param
      ? { active, name: ILike(`%${param.toUpperCase()}%`) }
      : { active };

    const [data, total] = await this.combosRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['combosServices', 'combosServices.servicesTypeVehicle', 'combosServices.servicesTypeVehicle.service', 'combosServices.servicesTypeVehicle.typeVehicle'],
      order: { comboId: 'ASC' },
      withDeleted: true,
    });

    // Calcular conteos adicionales (activos e inactivos)
    const [activeCount, inactiveCount] = await Promise.all([
      this.combosRepository.count({ where: { active: true } }),
      this.combosRepository.count({ where: { active: false }, withDeleted: false }),
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
    const combo = await this.combosRepository.findOne({
      where: { comboId: id },
      relations: ['combosServices', 'combosServices.servicesTypeVehicle', 'combosServices.servicesTypeVehicle.service', 'combosServices.servicesTypeVehicle.typeVehicle'],
      withDeleted: true,
    });
    if (!combo) throw new NotFoundException(`Combo con ID ${id} no encontrado`);
    return combo;
  }

  async update(id: number, updateComboDto: UpdateComboDto) {
    const combo = await this.findOne(id);
    if (!combo.active) throw new ConflictException('El combo está inactivo');

    // Validar nombre único si se cambia
    if (updateComboDto.name && updateComboDto.name !== combo.name) {
      const existing = await this.findByName(updateComboDto.name);
      if (existing) throw new ConflictException('Ya existe un combo con ese nombre');
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
      const updatedCombo = await queryRunner.manager.save(combo);

      // Actualizar relaciones si se envió el arreglo de servicios
      if (updateComboDto.servicesTypeVehicleIds) {
        // Eliminar las actuales
        await queryRunner.manager.delete(CombosServiceEntity, { comboId: id });

        // Insertar las nuevas
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
>>>>>>> master
}