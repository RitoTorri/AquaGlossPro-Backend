import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // Validamos duplicados
    await this.findDataDuplicate(createSupplierDto.ci, createSupplierDto.email, createSupplierDto.numberPhone);

    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  async remove(id: number) {
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporcionado');
    if (!supplierExists.active)
      throw new ConflictException('Proveedor está inactivo. No puede ser eliminado nuevamente');

    supplierExists.active = false;
    supplierExists.deletedAt = new Date();
    return await this.supplierRepository.save(supplierExists);
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    // Buscamos por id para verfiicar que este activo y exista
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporcionado');
    if (!supplierExists.active) throw new ConflictException('Proveedor está inactivo. No puede ser actualizado');

    // Validamos duplicados
    await this.findDataDuplicate(updateSupplierDto.ci, updateSupplierDto.email, updateSupplierDto.numberPhone, id);

    // Actualizamos el proveedor
    const updateSupplier = await this.supplierRepository.merge(supplierExists, updateSupplierDto);
    return await this.supplierRepository.save(updateSupplier);
  }

  async restore(id: number) {
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporcionado');
    if (supplierExists.active) throw new ConflictException('Proveedor está activo. No puede ser restaurado');

    return await this.supplierRepository.update(id, { active: true, deletedAt: null });
  }

  async findAll(active: boolean, page: number, limit: number, param: string | '') {
    const [suppliers, total] = await this.supplierRepository.findAndCount({
      where: [
        { active: active, names: ILike(`%${param?.toUpperCase()}%`) },
        { active: active, lastnames: ILike(`%${param?.toUpperCase()}%`) },
        { active: active, email: param?.toLowerCase() },
        { active: active, numberPhone: param },
        { active: active, ci: param?.toUpperCase() },
      ],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        supplierId: true,
        names: true,
        lastnames: true,
        email: true,
        numberPhone: true,
        ci: true,
        active: true,
      },
      order: { supplierId: 'ASC' },
      withDeleted: true,
    });

    return {
      data: suppliers,
      meta: {
        totalItems: total,
        itemCount: suppliers.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // Ayudadores de busqueda
  async findById(id: number) {
    return await this.supplierRepository.findOne({
      where: { supplierId: id },
      select: ['supplierId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findByEmail(email: string) {
    return await this.supplierRepository.findOne({
      where: { email: email },
      select: ['supplierId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findByNumberPhone(numberPhone: string) {
    return await this.supplierRepository.findOne({
      where: { numberPhone: numberPhone },
      select: ['supplierId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findByCi(ci: string) {
    return await this.supplierRepository.findOne({
      where: { ci: ci },
      select: ['supplierId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });
  }

  async findDataDuplicate(
    ci: string | null = null,
    email: string | null = null,
    numberPhone: string | null = null,
    supplierIdExclude: number | null = null,
  ) {
    // Condiciones para buscar duplicados
    const whereConditions: Array<{
      ci?: string;
      email?: string;
      numberPhone?: string;
      supplierIdExclude?: number;
    }> = [];

    // Agregamos las condiciones para buscar duplicados
    if (ci) whereConditions.push({ ci });
    if (email) whereConditions.push({ email });
    if (numberPhone) whereConditions.push({ numberPhone });

    // Buscamos el empleado
    const suppliers = await this.supplierRepository.find({
      where: whereConditions,
      select: ['supplierId', 'names', 'lastnames', 'email', 'numberPhone', 'ci', 'active'],
      withDeleted: true,
    });

    for (const supplier of suppliers) {
      if (supplierIdExclude && supplier.supplierId === supplierIdExclude) continue;
      if (ci && supplier.ci === ci) {
        throw new ConflictException('Ya existe un proveedor con ese CI.');
      }
      if (email && supplier.email === email) {
        throw new ConflictException('Ya existe un proveedor con ese email.');
      }
      if (numberPhone && numberPhone === supplier.numberPhone) {
        throw new ConflictException('Ya existe un proveedor con ese número de teléfono.');
      }
    }
  }
}
