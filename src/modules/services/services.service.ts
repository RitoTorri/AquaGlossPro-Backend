import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service } from './entities/service.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { typeCategories } from '../../shared/enums/types.categories.enums';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    // Validacion de existencia por nombre
    const serviceExists = await this.findByName(createServiceDto.name);
    if (serviceExists) throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, cambie el nombre');

    // Validar que la categoría exista
    const categoryExists = await this.categoriesService.findById(createServiceDto.categoryId);
    if (!categoryExists) throw new NotFoundException('No se encontro una categoría con el ID proporcionado');
    if (!categoryExists.active) throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
    if (categoryExists.type !== typeCategories.SERVICES)
      throw new ConflictException('La categoría seleccionada no es una de tipo servicios');

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
      if (serviceExists)
        throw new ConflictException('Ya existe un servicio con ese nombre. Por favor, use otro nombre.');
    }

    // Validamos que la categoría que se va a actualizar exista
    if (updateServiceDto.categoryId) {
      const categoryExists = await this.categoriesService.findById(updateServiceDto.categoryId);
      if (!categoryExists) throw new NotFoundException('No se encontro una categoría con el ID proporcionado');
      if (!categoryExists.active) throw new ConflictException('Categoría está inactiva. No puede ser utilizada');
      if (categoryExists.type !== typeCategories.SERVICES)
        throw new ConflictException('La categoría seleccionada no es una de tipo servicios');
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
        FROM services
    `;
    const totalsResult = await this.serviceRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condición WHERE base
    let whereCondition = `s.active = $3`;

    // Si param existe, buscar en name
    if (param && param.trim() !== '') {
      whereCondition += ` AND (s.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            s."serviceId",
            s.name,
            s."comissionPercentage",
            s.active,
            json_build_object(
                'categoryId', c."categoryId",
                'name', c.name,
                'type', c.type,
                'active', c.active
            ) AS category
        FROM services s
        INNER JOIN categories c ON s."categoryId" = c."categoryId"
        WHERE ${whereCondition}
        ORDER BY s."serviceId" ASC
        LIMIT $1 OFFSET $2
    `;

    console.log('Parameters:', parameters);
    console.log('Query:', dataQuery);

    const result = await this.serviceRepository.query(dataQuery, parameters);

    const services = result.map((row) => ({
      serviceId: row.serviceId,
      name: row.name,
      comissionPercentage: parseFloat(row.comissionPercentage),
      active: row.active,
      category: row.category,
    }));

    return {
      data: services,
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
