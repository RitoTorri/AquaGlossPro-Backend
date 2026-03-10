import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

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

  async findAll(active: boolean, page: number, limit: number, param: string) {
    try {
      const where = param 
        ? { active, name: ILike(`%${param.toUpperCase()}%`) }
        : { active };

      const [paymentMethods, total] = await this.paymentMethodRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          paymentMethodId: true,
          name: true,
          active: true,
          createdAt: true,
        },
        order: { paymentMethodId: 'ASC' },
        withDeleted: true,
      });

      return {
        data: paymentMethods,
        meta: {
          totalItems: total,
          itemCount: paymentMethods.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      throw error;
    }
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