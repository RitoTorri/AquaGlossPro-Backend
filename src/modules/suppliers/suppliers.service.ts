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
    private readonly supplierRepository: Repository<Supplier>
  ) { }

  async create(createSupplierDto: CreateSupplierDto) {
    // Validar que en la Db no exista un provedor con el email, telfono o cedula/rif
    const isEmailAlreadyRegistered = await this.findByEmail(createSupplierDto.email);
    if (isEmailAlreadyRegistered) throw new ConflictException('Ya existe un proveedor con ese email. Por favor, cambie el email');

    const isNumberPhoneAlreadyRegistered = await this.findByNumberPhone(createSupplierDto.numberPhone);
    if (isNumberPhoneAlreadyRegistered) throw new ConflictException('Ya existe un proveedor con ese numero de telefono. Por favor, cambie el numero de telefono');

    const isCiAlreadyRegistered = await this.findByCi(createSupplierDto.ci);
    if (isCiAlreadyRegistered) throw new ConflictException('Ya existe un proveedor con ese cedula o rif. Por favor, cambie el cedula o rif');

    const newSupplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(newSupplier);
  }

  async remove(id: number) {
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporcionado');
    if (!supplierExists.active) throw new ConflictException('Proveedor está inactivo. No puede ser eliminado nuevamente');

    supplierExists.active = false;
    supplierExists.deletedAt = new Date();
    return await this.supplierRepository.save(supplierExists);
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    // Buscamos por id para verfiicar que este activo y exista
    const supplierExists = await this.findById(id);
    if (!supplierExists) throw new NotFoundException('No se encontro un proveedor con el ID proporcionado');
    if (!supplierExists.active) throw new ConflictException('Proveedor está inactivo. No puede ser actualizado');

    // Verficamos que el email que se va a actualizar no exista
    if (updateSupplierDto.email) {
      const isEmailAlreadyRegistered = await this.findByEmail(updateSupplierDto.email);
      if (isEmailAlreadyRegistered && isEmailAlreadyRegistered.supplierId !== id) {
        throw new ConflictException('Ya existe un proveedor con ese email. Por favor, use otro email.');
      }
    }

    // VErficamos que el numero de telefono que se va a actualizar no exista
    if (updateSupplierDto.numberPhone) {
      const isNumberPhoneAlreadyRegistered = await this.findByNumberPhone(updateSupplierDto.numberPhone);
      if (isNumberPhoneAlreadyRegistered && isNumberPhoneAlreadyRegistered.supplierId !== id) {
        throw new ConflictException('Ya existe un proveedor con ese numero de telefono. Por favor, use otro numero de telefono.');
      }
    }

    // Verficamos que el cedula o rif que se va a actualizar no exista
    if (updateSupplierDto.ci) {
      const isCiAlreadyRegistered = await this.findByCi(updateSupplierDto.ci);
      if (isCiAlreadyRegistered && isCiAlreadyRegistered.supplierId !== id) {
        throw new ConflictException('Ya existe un proveedor con ese cedula o rif. Por favor, use otro cedula o rif.');
      }
    }

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
}
