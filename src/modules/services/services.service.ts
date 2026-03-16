import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service } from './entities/service.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { typeCategories } from '../../shared/enums/types.services.enums';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async create(createServiceDto: CreateServiceDto) {
    // Validacion de existencia por nombre
    const serviceExists = await this.findByName(createServiceDto.name);
    if (serviceExists) throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, cambie el nombre');

    // Validar que la categoría exista
    const categoryExists = await this.categoriesService.findById(createServiceDto.categoryId);
    if (!categoryExists) throw new NotFoundException('No se encontro una categoría con el ID proporcionado');
    if (!categoryExists.active) throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
    if (categoryExists.type !== typeCategories.SERVICES) throw new ConflictException('La categoría seleccionada no es una de tipo servicios');

    const newService = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(newService);
  }


  async remove(id: number) {
    const serviceExists = await this.findById(id);
    if (!serviceExists) throw new NotFoundException('No se encontro un servicio con el ID proporcionado');
    if (!serviceExists.active) throw new ConflictException('Servicio está inactivo. No puede ser eliminado nuevamente');

    serviceExists.active = false;
    serviceExists.deletedAt = new Date();
    return await this.serviceRepository.save(serviceExists);
  }


  async update(id: number, updateServiceDto: UpdateServiceDto) {
    // Buscamos por id para verfiicar que este activo y exista
    const serviceExists = await this.findById(id);
    if (!serviceExists) throw new NotFoundException('No se encontro un servicio con el ID proporcionado');
    if (!serviceExists.active) throw new ConflictException('Servicio está inactivo. No puede ser actualizado');

    // Verficamos que el nombre que se va a actualizar no exista
    if (updateServiceDto.name) {
      const serviceExists = await this.findByName(updateServiceDto.name);
      if (serviceExists) throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, use otro nombre.');
    }

    // Validamos que la categoría que se va a actualizar exista
    if (updateServiceDto.categoryId) {
      const categoryExists = await this.categoriesService.findById(updateServiceDto.categoryId);
      if (!categoryExists) throw new NotFoundException('No se encontro una categoría con el ID proporcionado');
      if (!categoryExists.active) throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
      if (categoryExists.type !== typeCategories.SERVICES) throw new ConflictException('La categoría seleccionada no es una de tipo servicios');
    }

    // Actualizamos el servicio
    const updateService = await this.serviceRepository.merge(serviceExists, updateServiceDto);
    return await this.serviceRepository.save(updateService);
  }


  async restore(id: number) {
    const serviceExists = await this.findById(id);
    if (!serviceExists) throw new NotFoundException('No se encontro un servicio con el ID proporcionado');
    if (serviceExists.active) throw new ConflictException('Servicio está activo. No puede ser restaurado');

    return await this.serviceRepository.update(id, { active: true, deletedAt: null });
  }


  async findAll(active: boolean, page: number, limit: number, param: string | null) {
    const [services, total] = await this.serviceRepository.findAndCount({
      where: { active: active, name: ILike(`%${param?.toLowerCase()}%`) },
      take: limit,
      skip: (page - 1) * limit,
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
        }
      },
      relations: ['category'],
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

  // Ayudadores de busqueda
  async findById(id: number) {
    return await this.serviceRepository.findOne({
      where: { serviceId: id },
      select: ['serviceId', 'name', 'comissionPercentage', 'active'],
      withDeleted: true,
    });
  }

  async findByName(name: string) {
    return await this.serviceRepository.findOne({
      where: { name: name },
      select: ['serviceId', 'name', 'comissionPercentage', 'active'],
      withDeleted: true,
    });
  }
}
