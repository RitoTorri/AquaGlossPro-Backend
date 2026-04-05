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
    private readonly clientsService: ClientsService,
    private readonly typeVehicleService: TypeVehicleService,
  ) {}

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
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // Asegurar tipos correctos
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const activeBool = active === true || active === 'true';

    // 1. Obtener totales globales de vehículos
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_general,
            COUNT(*) FILTER(WHERE active = true) AS total_active,
            COUNT(*) FILTER(WHERE active = false) AS total_inactive
        FROM vehicles
    `;
    const totalsResult = await this.vehiclesRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `v.active = $3`;

    // Si param existe, buscar en plate, owner.names o owner.lastnames
    if (param && param.trim() !== '') {
      whereCondition += ` AND (
            v.plate ILIKE $4 OR 
            c.names ILIKE $4 OR 
            c.lastnames ILIKE $4
        )`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            v."vehicleId",
            v.plate,
            v.active AS vehicle_active,
            json_build_object(
                'clientId', c."clientId",
                'names', c.names,
                'lastnames', c.lastnames,
                'numberPhone', c."numberPhone",
                'ci', c.ci,
                'active', c.active
            ) AS owner,
            json_build_object(
                'typeVehicleId', tv."typeVehicleId",
                'name', tv.name,
                'active', tv.active
            ) AS typeVehicle
        FROM vehicles v
        INNER JOIN clients c ON v."ownerId" = c."clientId"
        INNER JOIN types_vehicles tv ON v."typeVehicleId" = tv."typeVehicleId"
        WHERE ${whereCondition}
        ORDER BY v."vehicleId" ASC
        LIMIT $1 OFFSET $2
    `;

    console.log('Parameters:', parameters);
    console.log('Query:', dataQuery);

    const result = await this.vehiclesRepository.query(dataQuery, parameters);

    // Agrupar vehículos por cliente
    const clientsMap = new Map();

    result.forEach((row) => {
      const clientId = row.owner.clientId;

      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          clientId: row.owner.clientId,
          names: row.owner.names,
          lastnames: row.owner.lastnames,
          numberPhone: row.owner.numberPhone,
          ci: row.owner.ci,
          active: row.owner.active,
          vehicles: [],
        });
      }

      clientsMap.get(clientId).vehicles.push({
        vehicleId: row.vehicleId,
        plate: row.plate,
        active: row.vehicle_active,
        typeVehicle: row.typeVehicle,
      });
    });

    const clients = Array.from(clientsMap.values());

    return {
      data: clients,
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

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    // Validar que exista el vehiculo
    const vehicleExist = await this.findById(id);
    if (!vehicleExist || !vehicleExist.active)
      throw new NotFoundException('No existe un vehiculo con ese id o no está activo.');

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
      withDeleted: true,
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
