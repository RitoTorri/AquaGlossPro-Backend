import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from '../purchases_items/entities/purchase_items.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { StatusPayments } from '../../shared/enums/status-payments.enum';
import { QueryDateDto } from '../../shared/dto/query.date.dto';

// Importacion de servicios
import { ProductsService } from '../products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { PaymentsMethodsService } from '../payments-methods/payments-methods.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
    private readonly productsService: ProductsService,
    private readonly suppliersService: SuppliersService,
    private readonly paymentsMethodsService: PaymentsMethodsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // Validamos que el proveedor exista y este activo
    const supplier = await this.suppliersService.findById(createPurchaseDto.supplierId);
    if (!supplier || !supplier.active) {
      throw new ConflictException('Proveedor no encontrado o inactivo');
    }

    // Validamos que el metodo de pago exista y este activo
    const paymentMethod = await this.paymentsMethodsService.findById(createPurchaseDto.paymentMethodId);
    if (!paymentMethod || !paymentMethod.active) {
      throw new ConflictException('Método de pago no encontrado o inactivo');
    }

    // Iniciamos la transacción para asegurar atomicidad
    return await this.purchaseRepository.manager.transaction(async (transactionalEntityManager) => {
      let totalPurchaseAmount = 0;
      const purchaseItems: PurchaseItem[] = [];

      for (const itemDto of createPurchaseDto.items) {
        // Buscamos si el producto existe y esta activo
        const product = await this.productsService.findById(itemDto.productId);

        if (!product || !product.active) {
          throw new NotFoundException(`Producto ID ${itemDto.productId} no disponible o inactivo`);
        }

        // Extraemos el precio de cada litro del producto
        const unitPriceAtPurchase = itemDto.unitPrice;
        const subtotal = unitPriceAtPurchase * itemDto.quantity;
        totalPurchaseAmount += subtotal;

        // Preparamos el detalle de la compra
        const newItem = this.purchaseItemRepository.create({
          productId: product.productId,
          quantity: itemDto.quantity,
          unitPrice: unitPriceAtPurchase,
          subtotal: subtotal,
        });

        // Agregamos el nuevo item a la lista
        purchaseItems.push(newItem);

        /**
         * No se modifica el stock aun. Se debe de realizar al hacer el cambio de status a PAID
         */
      }

      // Creamos la compra
      const newPurchase = this.purchaseRepository.create({
        ...createPurchaseDto,
        totalAmount: totalPurchaseAmount,
        items: purchaseItems,
      });

      // Al guardar newPurchase, TypeORM guarda automáticamente todos los purchaseItems gracias al cascade: true
      return await transactionalEntityManager.save(newPurchase);
    });
  }

  async findAll(queryDateDto: QueryDateDto) {
    const { limit, page, active, param, startDate, endDate } = queryDateDto;

    const baseConditions: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      baseConditions.purchaseDate = Between(start, end);
    }

    // 2. Definir los estados válidos de tu sistema
    const validStatuses = ['P', 'W', 'C']; // Ajusta según tus Enums
    const isStatusSearch = param && param.length === 1 && validStatuses.includes(param.toUpperCase());

    let whereCondition: any;

    if (!param) {
      whereCondition = baseConditions;
    } else if (isStatusSearch) {
      whereCondition = { ...baseConditions, purchaseStatus: param.toUpperCase() };
    } else {
      const upperParam = param.toUpperCase();
      whereCondition = [
        { ...baseConditions, supplier: { names: ILike(`%${param}%`) } },
        { ...baseConditions, supplier: { lastnames: ILike(`%${param}%`) } },
        { ...baseConditions, supplier: { ci: upperParam } },
        { ...baseConditions, invoiceNumber: ILike(`%${param}%`) },
      ];
    }

    const query = `SELECT COALESCE(SUM("totalAmount"), 0) FROM purchases WHERE "purchaseStatus" = 'P'`;
    const investedCapitalResult = await this.purchaseRepository.query(query);

    // 2. Ejecución de la consulta con OR anidado
    const [purchases, total] = await this.purchaseRepository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['supplier', 'paymentMethod', 'items.product'], // Relaciones necesarias
      order: { purchaseId: 'ASC' }, // Compras más recientes primero
      withDeleted: true,
      select: {
        purchaseId: true,
        invoiceNumber: true,
        purchaseStatus: true,
        totalAmount: true,
        purchaseDate: true,
        paymentMethod: {
          name: true,
        },
        supplier: {
          companyName: true,
          rif: true,
          email: true,
          numberPhone: true,
        },
        items: {
          quantity: true,
          unitPrice: true,
          subtotal: true,
          product: {
            name: true,
          },
        },
      },
    });

    // 3. Estructura de respuesta que solicitaste
    return {
      data: { purchases, investedCapital: investedCapitalResult[0].coalesce },
      meta: {
        totalItems: total,
        itemCount: purchases.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    // Buscamos la compra
    const purchaseExists = await this.findPurchaseById(id);
    if (!purchaseExists) throw new NotFoundException('No existe una compra con el ID proporcionado');

    if (purchaseExists.purchaseStatus !== StatusPayments.PENDING) {
      throw new ConflictException('Solo las compras con status PENDING pueden ser actualizadas');
    }

    return await this.purchaseRepository.manager.transaction(async (manager) => {
      if (updatePurchaseDto.status === StatusPayments.PAID) {
        // Busca los productos de la venta para modificar su stock y precio
        const purchaseItems = await manager.find(PurchaseItem, {
          where: { purchaseId: id },
          relations: ['product'],
        });

        for (const item of purchaseItems) {
          await manager.update(Product, item.productId, {
            unitCostLiter: Number(item.unitPrice),
            currentStock: Number(item.product.currentStock) + Number(item.quantity),
            updatedAt: new Date(),
          });
        }
      }

      return await manager.update(Purchase, id, {
        purchaseStatus: updatePurchaseDto.status,
        updatedAt: new Date(),
      });
    });
  }

  async findPurchaseById(id: number) {
    return await this.purchaseRepository.findOne({
      where: { purchaseId: id },
      select: [
        'purchaseId',
        'supplierId',
        'paymentMethodId',
        'totalAmount',
        'purchaseDate',
        'invoiceNumber',
        'purchaseStatus',
        'createdAt',
      ],
      withDeleted: true,
    });
  }
}
