import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) { }

    async create(createServiceDto: CreateServiceDto) {
        const serviceExists = await this.findByName(createServiceDto.name);
        if (serviceExists) throw new ConflictException('Ya existe un servicio con ese nombre');
        const newService = this.serviceRepository.create(createServiceDto);
        return await this.serviceRepository.save(newService);
    }

    async remove(id: number) {
        const serviceExists = await this.findById(id);
        if (!serviceExists) throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
        if (!serviceExists.active) throw new ConflictException('El servicio ya está inactivo');
        serviceExists.active = false;
        serviceExists.deletedAt = new Date();
        return await this.serviceRepository.save(serviceExists);
    }

    async update(id: number, updateServiceDto: UpdateServiceDto) {
        const serviceExists = await this.findById(id);
        if (!serviceExists) throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
        if (!serviceExists.active) throw new ConflictException('El servicio está inactivo, no puede actualizarse');
        if (updateServiceDto.name) {
            const serviceWithSameName = await this.findByName(updateServiceDto.name);
            if (serviceWithSameName && serviceWithSameName.serviceId !== id) {
                throw new ConflictException('Ya existe un servicio con ese nombre');
            }
        }
        const updatedService = this.serviceRepository.merge(serviceExists, updateServiceDto);
        return await this.serviceRepository.save(updatedService);
    }

    async restore(id: number) {
        const serviceExists = await this.findById(id);
        if (!serviceExists) throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
        if (serviceExists.active) throw new ConflictException('El servicio ya está activo');
        return await this.serviceRepository.update(id, { active: true, deletedAt: null });
    }

    async findAll(active: boolean, page: number, limit: number, param: string | null) {
        const where = param
            ? { active, name: ILike(`%${param.toUpperCase()}%`) }
            : { active };
        const [services, total] = await this.serviceRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit,
            select: {
                serviceId: true,
                name: true,
                comissionPercentage: true,
                active: true,
                createdAt: true,
            },
            order: { serviceId: 'ASC' },
            withDeleted: true,
        });
        return {
            data: services,
            meta: {
                totalItems: total,
                itemCount: services.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }

    async findById(id: number) {
        return await this.serviceRepository.findOne({
            where: { serviceId: id },
            withDeleted: true,
        });
    }

    async findByName(name: string) {
        return await this.serviceRepository.findOne({
            where: { name },
            withDeleted: true,
        });
    }

    // Método findOne para ser usado por otros módulos
    async findOne(id: number): Promise<Service> {
        const service = await this.serviceRepository.findOne({
            where: { serviceId: id },
            withDeleted: true,
        });
        if (!service) {
            throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
        }
        return service;
    }
}