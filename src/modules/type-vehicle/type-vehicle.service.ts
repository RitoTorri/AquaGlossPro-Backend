import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createTypeVehicleDto: CreateTypeVehicleDto) {
    // Validar que el nombre no exista
    const typeVehicleExists = await this.findByName(createTypeVehicleDto.name);
    if (typeVehicleExists) {
      throw new ConflictException('Ya existe un tipo de vehículo con ese nombre');
    }

    const newTypeVehicle = this.typeVehicleRepository.create(createTypeVehicleDto);
    return await this.typeVehicleRepository.save(newTypeVehicle);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // Asegurar tipos correctos
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const activeBool = active === true || active === 'true';

    // 1. Obtener totales globales
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_general,
            COUNT(*) FILTER(WHERE active = true) AS total_active,
            COUNT(*) FILTER(WHERE active = false) AS total_inactive
        FROM types_vehicles
    `;
    const totalsResult = await this.typeVehicleRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `tv.active = $3`;

    // Si param existe, buscar en name
    if (param && param.trim() !== '') {
      whereCondition += ` AND (tv.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            tv."typeVehicleId",
            tv.name,
            tv.active,
            tv."createdAt"
        FROM types_vehicles tv
        WHERE ${whereCondition}
        ORDER BY tv."typeVehicleId" ASC
        LIMIT $1 OFFSET $2
    `;

    console.log('Parameters:', parameters);
    console.log('Query:', dataQuery);

    const result = await this.typeVehicleRepository.query(dataQuery, parameters);

    const typeVehicles = result.map((row) => ({
      typeVehicleId: row.typeVehicleId,
      name: row.name,
      active: row.active,
      createdAt: row.createdAt,
    }));

    return {
      data: typeVehicles,
      meta: {
        itemPerPage: limitNum,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(globalTotals.total_active) || 0) / limitNum)
          : Math.ceil((parseInt(globalTotals.total_inactive) || 0) / limitNum),
        totals: {
          general: parseInt(globalTotals.total_general) || 0,
          active: parseInt(globalTotals.total_active) || 0,
          inactive: parseInt(globalTotals.total_inactive) || 0,
        },
      },
    };
  }

  async update(id: number, updateTypeVehicleDto: UpdateTypeVehicleDto) {
    const typeVehicleExists = await this.findById(id);
    if (!typeVehicleExists) {
      throw new NotFoundException('No se encontró el tipo de vehículo con el ID proporcionado');
    }
    if (!typeVehicleExists.active) {
      throw new ConflictException('El tipo de vehículo está inactivo. No puede ser actualizado');
    }

    if (updateTypeVehicleDto.name) {
      const typeVehicleWithSameName = await this.findByName(updateTypeVehicleDto.name);
      if (typeVehicleWithSameName && typeVehicleWithSameName.typeVehicleId !== id) {
        throw new ConflictException('Ya existe un tipo de vehículo con ese nombre');
      }
    }

    const updatedTypeVehicle = this.typeVehicleRepository.merge(typeVehicleExists, updateTypeVehicleDto);
    return await this.typeVehicleRepository.save(updatedTypeVehicle);
  }

  async remove(id: number) {
    const typeVehicleExists = await this.findById(id);
    if (!typeVehicleExists) {
      throw new NotFoundException('No se encontró el tipo de vehículo con el ID proporcionado');
    }
    if (!typeVehicleExists.active) {
      throw new ConflictException('El tipo de vehículo ya está inactivo');
    }

    typeVehicleExists.active = false;
    typeVehicleExists.deletedAt = new Date();
    return await this.typeVehicleRepository.save(typeVehicleExists);
  }

  async restore(id: number) {
    const typeVehicleExists = await this.findById(id);
    if (!typeVehicleExists) {
      throw new NotFoundException('No se encontró el tipo de vehículo con el ID proporcionado');
    }
    if (typeVehicleExists.active) {
      throw new ConflictException('El tipo de vehículo ya está activo');
    }

    typeVehicleExists.active = true;
    typeVehicleExists.deletedAt = null;
    return await this.typeVehicleRepository.save(typeVehicleExists);
  }

  async findByName(name: string): Promise<TypeVehicle | null> {
    return await this.typeVehicleRepository.findOne({
      where: { name },
      withDeleted: true,
    });
  }

  async findById(id: number): Promise<TypeVehicle | null> {
    return await this.typeVehicleRepository.findOne({
      where: { typeVehicleId: id },
      withDeleted: true,
    });
  }
}
