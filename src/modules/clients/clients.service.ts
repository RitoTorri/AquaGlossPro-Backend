import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    // Validamos datos duplicados
    await this.findDataDuplicate(createClientDto.ci, createClientDto.numberPhone);

    const client = this.clientsRepository.create(createClientDto);
    return await this.clientsRepository.save(client);
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
    await this.findDataDuplicate(updateClientDto.ci, updateClientDto.numberPhone, id);

    const updateClient = await this.clientsRepository.merge(clientExist, updateClientDto);
    return await this.clientsRepository.save(updateClient);
  }

  async findAll(active: boolean, page: number, limit: number, param: string) {
    const [clients, total] = await this.clientsRepository.findAndCount({
      where: [
        { active: active, ci: ILike(`%${param}%`) },
        { active: active, names: ILike(`%${param.toUpperCase()}%`) },
        { active: active, lastnames: ILike(`%${param.toUpperCase()}%`) },
      ],
      take: limit,
      skip: (page - 1) * limit,
      select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'active'],
      order: { clientId: 'ASC' },
      withDeleted: true,
    });

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
    clientIdExclude: number | null = null,
  ) {
    const whereConditions: Array<{ ci?: string; numberPhone?: string }> = [];

    if (ci) whereConditions.push({ ci });
    if (numberPhone) whereConditions.push({ numberPhone });

    if (whereConditions.length === 0) return;

    const clients = await this.clientsRepository.find({
      where: whereConditions,
      select: ['clientId', 'ci', 'names', 'lastnames', 'numberPhone', 'active'],
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
    }
  }
}
