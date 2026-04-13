import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // Validamos duplicados
    await this.findDataDuplicate(createSupplierDto.rif, createSupplierDto.email, createSupplierDto.numberPhone);

    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  async remove(id: number) {
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporrifonado');
    if (!supplierExists.active)
      throw new ConflictException('Proveedor está inactivo. No puede ser eliminado nuevamente');

    supplierExists.active = false;
    supplierExists.deletedAt = new Date();
    return await this.supplierRepository.save(supplierExists);
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    // Buscamos por id para verfiicar que este activo y exista
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporrifonado');
    if (!supplierExists.active) throw new ConflictException('Proveedor está inactivo. No puede ser actualizado');

    // Validamos duplicados
    await this.findDataDuplicate(updateSupplierDto.rif, updateSupplierDto.email, updateSupplierDto.numberPhone, id);

    // Actualizamos el proveedor
    const updateSupplier = await this.supplierRepository.merge(supplierExists, updateSupplierDto);
    return await this.supplierRepository.save(updateSupplier);
  }

  async restore(id: number) {
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporrifonado');
    if (supplierExists.active) throw new ConflictException('Proveedor está activo. No puede ser restaurado');

    return await this.supplierRepository.update(id, { active: true, deletedAt: null });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param = null } = paginationDto;
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
        FROM suppliers
    `;
    const totalsResult = await this.supplierRepository.query(totalsQuery);
    const globalTotals = totalsResult[0];

    // 2. Construir parámetros en el orden correcto
    // $1 = limit, $2 = offset, $3 = active
    const parameters: any[] = [limitNum, offsetNum, activeBool];

    // Construir la condirifón WHERE base
    let whereCondition = `s.active = $3`;

    // Si param existe, buscar en múltiples campos
    if (param && param.trim() !== '') {
      whereCondition += ` AND (
            s.names ILIKE $4 OR 
            s.lastnames ILIKE $4 OR 
            s.email ILIKE $4 OR 
            s."numberPhone" ILIKE $4 OR 
            s.rif ILIKE $4
        )`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const dataQuery = `
        SELECT 
            s."supplierId",
            s.names,
            s.lastnames,
            s.email,
            s."numberPhone",
            s.rif,
            s.active
        FROM suppliers s
        WHERE ${whereCondition}
        ORDER BY s."supplierId" ASC
        LIMIT $1 OFFSET $2
    `;

    console.log('Parameters:', parameters);
    console.log('Query:', dataQuery);

    const result = await this.supplierRepository.query(dataQuery, parameters);

    const suppliers = result.map((row) => ({
      supplierId: row.supplierId,
      names: row.names,
      lastnames: row.lastnames,
      email: row.email,
      numberPhone: row.numberPhone,
      rif: row.rif,
      active: row.active,
    }));

    return {
      data: suppliers,
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
    return await this.supplierRepository.findOne({
      where: { supplierId: id },
      select: ['supplierId', 'companyName', 'email', 'numberPhone', 'rif', 'active'],
      withDeleted: true,
    });
  }

  async findByEmail(email: string) {
    return await this.supplierRepository.findOne({
      where: { email: email },
      select: ['supplierId', 'companyName', 'email', 'numberPhone', 'rif', 'active'],
      withDeleted: true,
    });
  }

  async findByNumberPhone(numberPhone: string) {
    return await this.supplierRepository.findOne({
      where: { numberPhone: numberPhone },
      select: ['supplierId', 'companyName', 'email', 'numberPhone', 'rif', 'active'],
      withDeleted: true,
    });
  }

  async findByrif(rif: string) {
    return await this.supplierRepository.findOne({
      where: { rif: rif },
      select: ['supplierId', 'companyName', 'email', 'numberPhone', 'rif', 'active'],
      withDeleted: true,
    });
  }

  async findDataDuplicate(
    rif: string | null = null,
    email: string | null = null,
    numberPhone: string | null = null,
    supplierIdExclude: number | null = null,
  ) {
    // Condirifones para buscar duplicados
    const whereConditions: Array<{
      rif?: string;
      email?: string;
      numberPhone?: string;
      supplierIdExclude?: number;
    }> = [];

    // Agregamos las condirifones para buscar duplicados
    if (rif) whereConditions.push({ rif });
    if (email) whereConditions.push({ email });
    if (numberPhone) whereConditions.push({ numberPhone });

    // Buscamos el empleado
    const suppliers = await this.supplierRepository.find({
      where: whereConditions,
      select: ['supplierId', 'companyName', 'email', 'numberPhone', 'rif', 'active'],
      withDeleted: true,
    });

    for (const supplier of suppliers) {
      if (supplierIdExclude && supplier.supplierId === supplierIdExclude) continue;
      if (rif && supplier.rif === rif) {
        throw new ConflictException('Ya existe un proveedor con ese rif.');
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
