import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { MailService } from '../../providers/mail/mail.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    private readonly manager: EntityManager,
    private readonly mailService: MailService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    // Validamos datos duplicados
    await this.findDataDuplicate(createClientDto.ci, createClientDto.numberPhone);

    const client = this.clientsRepository.create(createClientDto);
    const result = await this.clientsRepository.save(client);

    // Buscamos el rol de cliente
    const role = await this.manager.findOne(Role, { where: { name: 'CLIENT' }, select: ['roleId'] });
    if (!role) throw new ConflictException('No se encontró el rol CLIENT');

    // Creamos el usuario
    const password = await bcrypt.hash(result.ci, 10);
    const userData: CreateUserDto = {
      roleId: role.roleId,
      name: result.names,
      email: result.ci,
      password: password,
    };
    const user = await this.manager.findOne(User, { where: { email: userData.email } });
    if (user) {
      throw new ConflictException('Ya existe un usuario con ese correo electrónico');
    }
    const newUser = this.manager.create(User, userData);
    const newUserSaved = await this.manager.save(newUser);

    console.log('Usuario creado:');
    console.log(newUserSaved);

    // Enviamos el correo electrónico
    const mailResult = await this.mailService.sendMail(result.email, {
      names: result.names,
      lastnames: result.lastnames,
      username: result.ci,
      password: result.ci,
    });
    console.log(mailResult);
    return result;
  }

  async remove(id: number) {
    // Validamos existencia del cliente
    const clientExist = await this.findById(id);
    if (!clientExist) throw new NotFoundException('No se encontró el cliente con el id proporcionado');
    if (!clientExist.active) throw new ConflictException('El cliente está inactivo. No puede ser eliminado');

    clientExist.active = false;
    clientExist.deletedAt = new Date();
    return await this.clientsRepository.save(clientExist);
  }

  async restore(id: number) {
    // Validamos existencia del cliente
    const clientExist = await this.findById(id);
    if (!clientExist) throw new NotFoundException('No se encontró el cliente con el id proporcionado');
    if (clientExist.active) throw new ConflictException('El cliente está activo. No puede ser restaurado');

    return await this.clientsRepository.update(id, { active: true, deletedAt: null });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Validamos existencia del cliente
    const clientExist = await this.findById(id);
    if (!clientExist) throw new NotFoundException('No se encontró el cliente con el id proporcionado');
    if (!clientExist.active) throw new ConflictException('El cliente está inactivo. No puede ser actualizado');

    // Validamos datos duplicados
    await this.findDataDuplicate(updateClientDto.ci, updateClientDto.numberPhone, updateClientDto.email, id);

    const updateClient = await this.clientsRepository.merge(clientExist, updateClientDto);
    return await this.clientsRepository.save(updateClient);
  }

  async findClients(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset: number = (page - 1) * limit;

    // 1. Obtener totales globales (sin paginación y sin filtro de active en el WHERE final)
    const totalsQuery = `
      SELECT 
          COUNT(*) AS total_items,
          COUNT(*) FILTER(WHERE active = true) AS total_items_active,
          COUNT(*) FILTER(WHERE active = false) AS total_items_inactive,
          SUM(vehicle_count) AS total_vehicles,
          ROUND(
              AVG(vehicle_count) FILTER (WHERE vehicle_count > 0)::NUMERIC, 2
          ) AS vehicle_average,
          COUNT(*) FILTER (WHERE vehicle_count >= 3) AS clients_with_3_plus_vehicles
      FROM (
          SELECT 
              c."clientId", 
              c.active,
              COUNT(v."vehicleId") FILTER (WHERE v.active = true) AS vehicle_count
          FROM clients c
          LEFT JOIN vehicles v ON c."clientId" = v."ownerId"
          GROUP BY c."clientId", c.active
      ) AS client_summary;
    `;
    const totalsResult = await this.clientsRepository.query(totalsQuery);
    const totals = totalsResult[0] || { total_items: 0, total_items_active: 0, total_items_inactive: 0 };

    // 2. Obtener datos paginados con filtros
    const parameters: any[] = [limit, offset, active];
    let dataQuery = `
        SELECT 
            c."clientId",
            (SELECT COUNT(*) FROM vehicles v1 WHERE v1."ownerId" = c."clientId" AND v1.active = true) AS count_vehicles,
            c.names,
            c.lastnames,
            c."numberPhone",
            c.ci,
            c.active
        FROM clients c
        WHERE c.active = $3
    `;

    // Si param existe, agregar condición de búsqueda
    if (param && param.trim() !== '') {
      dataQuery += ` AND (c.ci ILIKE $4 OR c.names ILIKE $4 OR c.lastnames ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    dataQuery += `  ORDER BY c."clientId" ASC LIMIT $1 OFFSET $2`;

    console.log(parameters);

    const result = await this.clientsRepository.query(dataQuery, parameters);

    const clients = result.map((row) => ({
      clientId: row.clientId,
      names: row.names,
      lastnames: row.lastnames,
      numberPhone: row.numberPhone,
      ci: row.ci,
      active: row.active,
      countVehicles: parseInt(row.count_vehicles) || 0,
    }));

    return {
      data: clients,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: paginationDto.active
          ? Math.ceil((parseInt(totals.total_items_active) || 0) / limit)
          : Math.ceil((parseInt(totals.total_items_inactive) || 0) / limit),
        totals: {
          general: parseInt(totals.total_items) || 0,
          active: parseInt(totals.total_items_active) || 0,
          inactive: parseInt(totals.total_items_inactive) || 0,
          vehicleAverage: parseFloat(totals.vehicle_average) || 0,
          clientsWith3PlusVehicles: parseInt(totals.clients_with_3_plus_vehicles) || 0,
          totalVehicles: parseInt(totals.total_vehicles) || 0,
        },
      },
    };
  }

  // Ayudadores de busqueda
  async findById(id: number) {
    try {
      return await this.clientsRepository.findOne({
        where: { clientId: id },
        select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'active'],
        withDeleted: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async findByCi(ci: string) {
    try {
      return await this.clientsRepository.findOne({
        where: { ci: ci },
        select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'active'],
        withDeleted: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async findByNumberPhone(numberPhone: string) {
    try {
      return await this.clientsRepository.findOne({
        where: { numberPhone: numberPhone },
        select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'active'],
        withDeleted: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async findDataDuplicate(
    ci: string | null = null,
    numberPhone: string | null = null,
    email: string | null | undefined = null,
    clientIdExclude: number | null = null,
  ) {
    const whereConditions: Array<{ ci?: string; numberPhone?: string; email?: string }> = [];

    if (ci) whereConditions.push({ ci });
    if (numberPhone) whereConditions.push({ numberPhone });
    if (email) whereConditions.push({ email });

    if (whereConditions.length === 0) return;

    const clients = await this.clientsRepository.find({
      where: whereConditions,
      select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'email', 'active'],
      withDeleted: true,
    });

    for (const client of clients) {
      if (clientIdExclude && client.clientId === clientIdExclude) continue;

      if (client.ci === ci) {
        throw new ConflictException('La cedula o rif proporcionado ya existe');
      }

      if (client.numberPhone === numberPhone) {
        throw new ConflictException('El número de teléfono proporcionado ya existe');
      }

      if (client.email === email) {
        throw new ConflictException('El email proporcionado ya existe');
      }
    }
  }
}
