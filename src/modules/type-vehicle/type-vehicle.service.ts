import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { TypeVehicle } from './entities/type-vehicle.entity';
import { CreateTypeVehicleDto } from './dto/create-type-vehicle.dto';
import { UpdateTypeVehicleDto } from './dto/update-type-vehicle.dto';

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

  async findAll(active: boolean, page: number, limit: number, param: string) {
    try {
      const where = param 
        ? { active, name: ILike(`%${param.toUpperCase()}%`) }
        : { active };

      const [typeVehicles, total] = await this.typeVehicleRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          typeVehicleId: true,
          name: true,
          active: true,
          createdAt: true,
        },
        order: { typeVehicleId: 'ASC' },
        withDeleted: true,
      });

      return {
        data: typeVehicles,
        meta: {
          totalItems: total,
          itemCount: typeVehicles.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      throw error;
    }
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