import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, ILike } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ClientsService } from '../clients/clients.service';
import { TypeVehicleService } from '../type-vehicle/type-vehicle.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    private readonly clientsService: ClientsService,
    private readonly typeVehicleService: TypeVehicleService
  ) { }


  async create(createVehicleDto: CreateVehicleDto) {
    // Validar que no exista un vehiculo con la misma placa
    const isPlateAlreadyInUse = await this.getVehicleByPlate(createVehicleDto.plate);
    if (isPlateAlreadyInUse) throw new ConflictException('La placa del vehiculo ya esta en uso.');

    // Validar que exista el cliente
    const client = await this.clientsService.findById(createVehicleDto.ownerId);
    if (!client || !client.active) throw new NotFoundException('No existe un cliente con ese id.');

    // Validar que exista el tipo de vehiculo
    const typeVehicle = await this.typeVehicleService.findById(createVehicleDto.typeVehicleId);
    if (!typeVehicle || !typeVehicle.active) throw new NotFoundException('No existe un tipo de vehiculo con ese id.');

    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, param, active } = paginationDto;
    const skip = (page - 1) * limit;

  
    const [vehicles, total] = await this.vehiclesRepository.findAndCount({
      where: [
        { active, plate: param },
        { active, owner: { names: ILike(`%${param}%`) } },
        { active, owner: { lastnames: ILike(`%${param}%`) } },
      ],
      select: {
        vehicleId: true,
        plate: true,
        active: true,
        owner: {
          clientId: true,
          names: true,
          lastnames: true,
          numberPhone: true,
          ci: true,
          active: true
        },
        typeVehicle: {
          typeVehicleId: true,
          name: true,
          active: true
        }
      },
      take: limit,
      skip,
      order: { vehicleId: 'ASC' },
      relations: ['owner', 'typeVehicle'],
      withDeleted: true,
    });

    // Agrupar vehículos por cliente
    const clientsMap = new Map();

    vehicles.forEach(vehicle => {
      const clientId = vehicle.owner.clientId;

      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          clientId: vehicle.owner.clientId,
          names: vehicle.owner.names,
          lastnames: vehicle.owner.lastnames,
          numberPhone: vehicle.owner.numberPhone,
          ci: vehicle.owner.ci,
          active: vehicle.owner.active,
          vehicles: []
        });
      }

      clientsMap.get(clientId).vehicles.push({
        vehicleId: vehicle.vehicleId,
        plate: vehicle.plate,
        active: vehicle.active,
        typeVehicle: vehicle.typeVehicle
      });
    });

    const clients = Array.from(clientsMap.values());

    return {
      data: clients,
      meta: {
        totalItems: total,
        itemCount: clients.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };

    /*const [vehicles, total] = await this.vehiclesRepository.findAndCount({
      where: [
        { active, plate: param },
        { active, owner: { names: ILike(`%${param}%`) } },
        { active, owner: { lastnames: ILike(`%${param}%`) } },
        { active, owner: { ci: param } },
      ],
      select: {
        vehicleId: true,
        plate: true,
        active: true,
        owner: {
          clientId: true,
          names: true,
          lastnames: true,
          numberPhone: true,
          ci: true,
          active: true
        },
        typeVehicle: {
          typeVehicleId: true,
          name: true,
          active: true
        }
      },
      take: limit,
      skip,
      order: { vehicleId: 'ASC' },
      relations: ['owner', 'typeVehicle'],
      withDeleted: true,
    })

    return {
      data: vehicles,
      meta: {
        totalItems: total,
        itemCount: vehicles.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };*/
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    // Validar que exista el vehiculo
    const vehicleExist = await this.findById(id);
    if (!vehicleExist || !vehicleExist.active) throw new NotFoundException('No existe un vehiculo con ese id o no está activo.');

    // Validar que exista el cliente
    if (updateVehicleDto.ownerId) {
      const client = await this.clientsService.findById(updateVehicleDto.ownerId);
      if (!client || !client.active) throw new NotFoundException('No existe un cliente con ese id.');
    }

    // Validar que exista el tipo de vehiculo
    if (updateVehicleDto.typeVehicleId) {
      const typeVehicle = await this.clientsService.findById(updateVehicleDto.typeVehicleId);
      if (!typeVehicle || !typeVehicle.active) throw new NotFoundException('No existe un tipo de vehiculo con ese id.');
    }

    const updateVehicle = await this.vehiclesRepository.merge(vehicleExist, updateVehicleDto);
    return await this.vehiclesRepository.save(updateVehicle);
  }

  async restore(id: number) {
    // Validar que exista el vehiculo
    const vehicleExist = await this.findById(id);
    if (!vehicleExist) throw new NotFoundException('No existe un vehiculo con ese id.');
    if (vehicleExist.active) throw new ConflictException('El vehiculo ya esta activo. No se puede restaurar.');

    vehicleExist.active = true;
    return this.vehiclesRepository.save(vehicleExist);
  }

  async remove(id: number) {
    // Validar que exista el vehiculo
    const vehicleExist = await this.findById(id);
    if (!vehicleExist) throw new NotFoundException('No existe un vehiculo con ese id.');
    if (!vehicleExist.active) throw new ConflictException('El vehiculo esta inactivo. No se puede eliminar.');

    vehicleExist.active = false;
    vehicleExist.deletedAt = new Date();
    return this.vehiclesRepository.save(vehicleExist);
  }

  // Ayudadores
  async getVehicleByPlate(plate: string) {
    return await this.vehiclesRepository.findOne({
      where: { plate },
      select: ['vehicleId', 'typeVehicleId', 'ownerId', 'plate', 'active'],
      withDeleted: true
    });
  }

  async findById(id: number) {
    return await this.vehiclesRepository.findOne({
      where: { vehicleId: id },
      select: ['vehicleId', 'typeVehicleId', 'ownerId', 'plate', 'active'],
      withDeleted: true,
    });
  }
}