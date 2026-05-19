import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CategoriesService } from '../categories/categories.service';
import { typeCategories } from '../../shared/enums/types.categories.enums';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const serviceExists = await this.findByName(createServiceDto.name);
    if (serviceExists) {
      throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, cambie el nombre');
    }

    const categoryExists = await this.categoriesService.findById(createServiceDto.categoryId);
    if (!categoryExists) {
      throw new NotFoundException('No se encontró una categoría con el ID proporcionado');
    }
    if (!categoryExists.active) {
      throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
    }
    if (categoryExists.type !== typeCategories.SERVICES) {
      throw new ConflictException('La categoría seleccionada no es una de tipo servicios');
    }

    const newService = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(newService);
  }

  async findAll(paginationDto: PaginationDto) {
    const { active, page, limit, param } = paginationDto;
    const where = param
      ? { active, name: ILike(`%${param.toUpperCase()}%`) }
      : { active };

    const [data, total] = await this.serviceRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['category'],
      select: {
        serviceId: true,
        name: true,
        comissionPercentage: true,
        active: true,
        category: {
          categoryId: true,
          name: true,
          type: true,
          active: true,
        },
      },
      order: { serviceId: 'ASC' },
      withDeleted: true,
    });

    const activeCount = await this.serviceRepository.count({ where: { active: true } });
    const inactiveCount = await this.serviceRepository.count({ where: { active: false } });

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

  async findById(id: number): Promise<Service | null> {
    return await this.serviceRepository.findOne({
      where: { serviceId: id },
      select: ['serviceId', 'name', 'comissionPercentage', 'active'],
      withDeleted: true,
    });
  }

  async findByName(name: string): Promise<Service | null> {
    return await this.serviceRepository.findOne({
      where: { name: name },
      select: ['serviceId', 'name', 'comissionPercentage', 'active'],
      withDeleted: true,
    });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const serviceExists = await this.findById(id);
    if (!serviceExists) {
      throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
    }
    if (!serviceExists.active) {
      throw new ConflictException('Servicio está inactivo. No puede ser actualizado');
    }

    if (updateServiceDto.name) {
      const serviceExistsByName = await this.findByName(updateServiceDto.name);
      if (serviceExistsByName && serviceExistsByName.serviceId !== id) {
        throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, use otro nombre.');
      }
    }

    if (updateServiceDto.categoryId) {
      const categoryExists = await this.categoriesService.findById(updateServiceDto.categoryId);
      if (!categoryExists) {
        throw new NotFoundException('No se encontró una categoría con el ID proporcionado');
      }
      if (!categoryExists.active) {
        throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
      }
      if (categoryExists.type !== typeCategories.SERVICES) {
        throw new ConflictException('La categoría seleccionada no es una de tipo servicios');
      }
    }

    const updateService = this.serviceRepository.merge(serviceExists, updateServiceDto);
    return await this.serviceRepository.save(updateService);
  }

  async remove(id: number): Promise<Service> {
    const serviceExists = await this.findById(id);
    if (!serviceExists) {
      throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
    }
    if (!serviceExists.active) {
      throw new ConflictException('Servicio está inactivo. No puede ser eliminado nuevamente');
    }

    serviceExists.active = false;
    serviceExists.deletedAt = new Date();
    return await this.serviceRepository.save(serviceExists);
  }

  async restore(id: number): Promise<Service> {
    const serviceExists = await this.findById(id);
    if (!serviceExists) {
      throw new NotFoundException('No se encontró un servicio con el ID proporcionado');
    }
    if (serviceExists.active) {
      throw new ConflictException('Servicio está activo. No puede ser restaurado');
    }

    serviceExists.active = true;
    serviceExists.deletedAt = null;
    return await this.serviceRepository.save(serviceExists);
  }
}