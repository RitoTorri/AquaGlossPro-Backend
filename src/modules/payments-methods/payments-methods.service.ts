import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class PaymentsMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    // Validar que el nombre no exista
    const paymentMethodExists = await this.findByName(createPaymentMethodDto.name);
    if (paymentMethodExists) {
      throw new ConflictException('Ya existe un método de pago con ese nombre');
    }

    const newPaymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
    return await this.paymentMethodRepository.save(newPaymentMethod);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, active, param } = paginationDto;
    const offset = (page - 1) * limit;

    // 1. Obtener totales globales (sin paginación)
    const totalsQuery = `
        SELECT 
            COUNT(*) AS total_items,
            COUNT(*) FILTER(WHERE active = true) AS total_items_active,
            COUNT(*) FILTER(WHERE active = false) AS total_items_inactive
        FROM payments_methods
    `;
    const totalsResult = await this.paymentMethodRepository.query(totalsQuery);
    const totals = totalsResult[0] || { total_items: 0, total_items_active: 0, total_items_inactive: 0 };

    // 2. Obtener datos paginados con filtros
    const parameters: any[] = [limit, offset, active];
    let dataQuery = `
        SELECT 
            pm."paymentMethodId",
            pm.name,
            pm.active,
            pm."createdAt"
        FROM payments_methods pm
        WHERE pm.active = $3
        ORDER BY pm."paymentMethodId" ASC
        LIMIT $1 OFFSET $2
    `;

    // Si param existe, agregar condición de búsqueda por name
    if (param && param.trim() !== '') {
      dataQuery += ` AND (pm.name ILIKE $4)`;
      parameters.push(`%${param.toUpperCase()}%`);
    }

    const result = await this.paymentMethodRepository.query(dataQuery, parameters);

    const paymentMethods = result.map((row) => ({
      paymentMethodId: row.paymentMethodId,
      name: row.name,
      active: row.active,
      createdAt: row.createdAt,
    }));

    return {
      data: paymentMethods,
      meta: {
        itemPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil((parseInt(totals.total_items) || 0) / limit),
        totals: {
          general: parseInt(totals.total_items) || 0,
          active: parseInt(totals.total_items_active) || 0,
          inactive: parseInt(totals.total_items_inactive) || 0,
        },
      },
    };
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const paymentMethodExists = await this.findById(id);
    if (!paymentMethodExists) {
      throw new NotFoundException('No se encontró el método de pago con el ID proporcionado');
    }
    if (!paymentMethodExists.active) {
      throw new ConflictException('El método de pago está inactivo. No puede ser actualizado');
    }

    if (updatePaymentMethodDto.name) {
      const paymentMethodWithSameName = await this.findByName(updatePaymentMethodDto.name);
      if (paymentMethodWithSameName && paymentMethodWithSameName.paymentMethodId !== id) {
        throw new ConflictException('Ya existe un método de pago con ese nombre');
      }
    }

    const updatedPaymentMethod = this.paymentMethodRepository.merge(paymentMethodExists, updatePaymentMethodDto);
    return await this.paymentMethodRepository.save(updatedPaymentMethod);
  }

  async remove(id: number) {
    const paymentMethodExists = await this.findById(id);
    if (!paymentMethodExists) {
      throw new NotFoundException('No se encontró el método de pago con el ID proporcionado');
    }
    if (!paymentMethodExists.active) {
      throw new ConflictException('El método de pago ya está inactivo');
    }

    paymentMethodExists.active = false;
    paymentMethodExists.deletedAt = new Date();
    return await this.paymentMethodRepository.save(paymentMethodExists);
  }

  async restore(id: number) {
    const paymentMethodExists = await this.findById(id);
    if (!paymentMethodExists) {
      throw new NotFoundException('No se encontró el método de pago con el ID proporcionado');
    }
    if (paymentMethodExists.active) {
      throw new ConflictException('El método de pago ya está activo');
    }

    paymentMethodExists.active = true;
    paymentMethodExists.deletedAt = null;
    return await this.paymentMethodRepository.save(paymentMethodExists);
  }

  async findByName(name: string): Promise<PaymentMethod | null> {
    return await this.paymentMethodRepository.findOne({
      where: { name },
      withDeleted: true,
    });
  }

  async findById(id: number): Promise<PaymentMethod | null> {
    return await this.paymentMethodRepository.findOne({
      where: { paymentMethodId: id },
      withDeleted: true,
    });
  }
}
