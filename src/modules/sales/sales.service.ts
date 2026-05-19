import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleStatusWashingDto } from './dto/update-sale-status-washing.dto';
import { UpdateSaleStatusPaymentDto } from './dto/update-sale-status-payment.dto';
import { StatusPayments } from '../../shared/enums/status-payments.enum';
import { Sale } from './entities/sale.entity';
import { QueryDateDto } from '../../shared/dto/query.date.dto';
import { StatusWashing } from '../../shared/enums/status.washing';
import { generateInvoiceNumber } from '../../shared/utils/invoice_generate.utils';

interface ServiceMapping {
  serviceTypeVehicleId: number;
  serviceId: number;
  price: number;
  serviceName: string;
  comissionPercentage: number;
}

interface ConvertedService {
  employeeId: number;
  serviceId: number;
  serviceTypeVehicleId: number;
  comboOriginId?: number;
  discount?: number;
  notes?: string | null;
}

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const { services, ...rest } = createSaleDto;
    console.log('Datos recibidos:', { services, ...rest });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      /**
       * VALIDACIONES INICIALES
       */

      // 1. Verificar existencia de cliente, vehículo y método de pago
      const isExistsData = await queryRunner.manager.query(
        `
        SELECT 
          (SELECT EXISTS(SELECT 1 FROM clients WHERE "clientId" = $1 AND "active" = TRUE)) AS "clientExists",
          (SELECT EXISTS(SELECT 1 FROM vehicles WHERE "vehicleId" = $2 AND "active" = TRUE AND "ownerId" = $1)) AS "vehicleExists",
          (SELECT EXISTS(SELECT 1 FROM payments_methods WHERE "paymentMethodId" = $3 AND "active" = TRUE)) AS "paymentMethodExists";
        `,
        [rest.clientId, rest.vehicleId, rest.paymentMethodId],
      );

      console.log('Validación de existencia:', isExistsData[0]);

      const { clientExists, vehicleExists, paymentMethodExists } = isExistsData[0];
      if (!clientExists || !vehicleExists || !paymentMethodExists) {
        throw new NotFoundException(
          'El cliente, vehículo o método de pago no existe. Verifique también que el cliente sea dueño del vehículo.',
        );
      }

      // 2. Verificar que el vehículo no esté en otra venta activa
      const isVehicleInSale = await queryRunner.manager.query(
        `
        SELECT NOT EXISTS (
          SELECT 1
          FROM sales
          WHERE "vehicleId" = $1
            AND "statusWashing" IN ('W', 'I')
        ) AS disponible;  
        `,
        [rest.vehicleId],
      );
      console.log('Vehículo disponible:', isVehicleInSale[0]);

      if (!isVehicleInSale[0].disponible) {
        throw new ConflictException(`El vehículo id:${rest.vehicleId} está en proceso de limpieza en otra venta.`);
      }

      // 3. Obtener el tipo de vehículo
      const vehicleType = await queryRunner.manager.query(
        `SELECT "typeVehicleId" FROM vehicles WHERE "vehicleId" = $1 AND "active" = TRUE`,
        [rest.vehicleId],
      );

      if (!vehicleType.length) {
        throw new NotFoundException('El vehículo no existe o está inactivo.');
      }

      const typeVehicleId = vehicleType[0].typeVehicleId;
      console.log('Tipo de vehículo:', typeVehicleId);

      /**
       * CONVERSIÓN DE serviceId A serviceTypeVehicleId
       * Esta es la parte clave que necesitabas
       */
      let convertedServices: ConvertedService[] = [];

      if (services && services.length > 0) {
        // Extraer los serviceId únicos
        const serviceIds = [...new Set(services.map((s) => s.serviceId))];
        console.log('Service IDs recibidos:', serviceIds);

        // Buscar los serviceTypeVehicleId correspondientes al tipo de vehículo
        const serviceTypeVehicleMapping: ServiceMapping[] = await queryRunner.manager.query(
          `
          SELECT 
            stv."serviceTypeVehicleId",
            stv."serviceId",
            stv."price",
            s."name" as "serviceName",
            s."comissionPercentage"
          FROM services_type_vehicle stv
          INNER JOIN services s ON stv."serviceId" = s."serviceId"
          WHERE stv."serviceId" = ANY($1)
            AND stv."typeVehicleId" = $2
            AND stv."active" = TRUE
            AND s."active" = TRUE
          `,
          [serviceIds, typeVehicleId],
        );

        console.log('Mapeo serviceId -> serviceTypeVehicleId:', serviceTypeVehicleMapping);

        // Verificar que todos los servicios existen para este tipo de vehículo
        if (serviceTypeVehicleMapping.length !== serviceIds.length) {
          const foundServiceIds = serviceTypeVehicleMapping.map((s) => s.serviceId);
          const missingServiceIds = serviceIds.filter((id) => !foundServiceIds.includes(id));
          throw new BadRequestException(
            `Los siguientes servicios no están disponibles para este tipo de vehículo: ${missingServiceIds.join(', ')}`,
          );
        }

        // Crear mapa de conversión tipado correctamente
        const serviceMap = new Map<number, ServiceMapping>(serviceTypeVehicleMapping.map((s) => [s.serviceId, s]));

        // Convertir los servicios con tipado correcto
        convertedServices = services.map((service) => {
          const mapping = serviceMap.get(service.serviceId);
          if (!mapping) {
            throw new BadRequestException(
              `No se encontró el servicio ID ${service.serviceId} para el tipo de vehículo ${typeVehicleId}`,
            );
          }
          return {
            employeeId: service.employeeId,
            serviceId: service.serviceId,
            serviceTypeVehicleId: mapping.serviceTypeVehicleId,
            comboOriginId: service.comboOriginId,
            discount: service.discount,
            notes: service.notes,
          };
        });

        console.log('Servicios convertidos:', convertedServices);
      }

      /**
       * VALIDACIONES DE EMPLEADOS
       */
      if (convertedServices.length > 0) {
        for (const service of convertedServices) {
          const isEmployeeInSale = await queryRunner.manager.query(
            `
            SELECT 
              e."employeeId",
              e."names",
              e."lastnames",
              NOT EXISTS (
                SELECT 1
                FROM services_assignments sa
                INNER JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
                INNER JOIN sales s ON si."saleId" = s."saleId"
                WHERE sa."employeeId" = e."employeeId"
                  AND s."statusWashing" IN ('W', 'I')
              ) AS disponible
            FROM employees e
            WHERE e."employeeId" = $1
              AND e."active" = TRUE
              AND e."deletedAt" IS NULL;
            `,
            [service.employeeId],
          );

          console.log('Disponibilidad de empleado:', isEmployeeInSale[0]);

          if (!isEmployeeInSale[0] || !isEmployeeInSale[0].disponible) {
            throw new ConflictException(
              `El empleado id: ${isEmployeeInSale[0]?.employeeId} ${isEmployeeInSale[0]?.names || ''} está asignado en otra venta activa.`,
            );
          }
        }
      }

      /**
       * CREACIÓN DE LA VENTA
       */
      const dataSale = {
        ...rest,
        invoiceNumber: generateInvoiceNumber(),
        initialState: rest.initialState || null,
      };

      console.log('Datos de venta a guardar:', dataSale);

      const sale = (
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('sales')
          .values(dataSale)
          .returning([
            'saleId',
            'clientId',
            'vehicleId',
            'paymentMethodId',
            'statusSale',
            'statusWashing',
            'initialState',
            'saleDate',
          ])
          .execute()
      ).generatedMaps[0];

      console.log('Venta creada:', sale);

      /**
       * VALIDACIÓN DE COMBOS Y CÁLCULO DE PRECIOS
       */

      // Extraer IDs únicos
      const serviceTypeVehicleIds = [...new Set(convertedServices?.map((s) => s.serviceTypeVehicleId))];
      const employeesSetIds = [...new Set(convertedServices?.map((s) => s.employeeId))];
      const combosSetIds = [
        ...new Set(convertedServices?.map((s) => s.comboOriginId).filter((id): id is number => id != null)),
      ];

      console.log('ServiceTypeVehicleIds:', serviceTypeVehicleIds);
      console.log('Employees:', employeesSetIds);
      console.log('Combos:', combosSetIds);

      // Validación de combos
      if (combosSetIds.length > 0) {
        // Validar existencia, actividad y expiración de combos
        const combosInfo = await queryRunner.manager.query(
          `
          SELECT "comboId", "active", "expirationDate", "name"
          FROM combos
          WHERE "comboId" = ANY($1)
          `,
          [combosSetIds],
        );

        if (combosInfo.length !== combosSetIds.length) {
          throw new NotFoundException('Uno o más combos no existen.');
        }

        for (const combo of combosInfo) {
          if (!combo.active) {
            throw new BadRequestException(`El combo "${combo.name}" (ID: ${combo.comboId}) no está activo.`);
          }
          if (combo.expirationDate && new Date(combo.expirationDate) < new Date()) {
            throw new BadRequestException(`El combo "${combo.name}" (ID: ${combo.comboId}) ha expirado.`);
          }
        }

        // Validar que los servicios enviados coincidan exactamente con los del combo
        const comboServices = await queryRunner.manager.query(
          `
          SELECT cs."comboId", cs."serviceId", stv."serviceTypeVehicleId"
          FROM combos_services cs
          INNER JOIN services_type_vehicle stv ON cs."serviceId" = stv."serviceId"
          WHERE cs."comboId" = ANY($1) 
            AND cs."active" = TRUE
            AND stv."typeVehicleId" = $2
          `,
          [combosSetIds, typeVehicleId],
        );

        // Agrupar servicios esperados por combo
        const expectedServicesMap = new Map<number, Set<number>>();
        for (const row of comboServices) {
          if (!expectedServicesMap.has(row.comboId)) {
            expectedServicesMap.set(row.comboId, new Set<number>());
          }
          expectedServicesMap.get(row.comboId)!.add(row.serviceTypeVehicleId);
        }

        // Agrupar servicios proporcionados por combo
        const providedServicesMap = new Map<number, Set<number>>();
        for (const s of convertedServices) {
          const comboId = s.comboOriginId;
          if (comboId != null) {
            if (!providedServicesMap.has(comboId)) {
              providedServicesMap.set(comboId, new Set<number>());
            }
            providedServicesMap.get(comboId)!.add(s.serviceTypeVehicleId);
          }
        }

        // Comparar servicios
        for (const comboId of combosSetIds) {
          const expected = expectedServicesMap.get(comboId) ?? new Set<number>();
          const provided = providedServicesMap.get(comboId) ?? new Set<number>();

          const expectedArr = Array.from(expected).sort((a, b) => a - b);
          const providedArr = Array.from(provided).sort((a, b) => a - b);

          if (JSON.stringify(expectedArr) !== JSON.stringify(providedArr)) {
            throw new BadRequestException(
              `El combo ID ${comboId} requiere exactamente los servicios: [${expectedArr.join(', ')}]. ` +
                `Recibidos: [${providedArr.join(', ')}].`,
            );
          }
        }
      }

      // Verificar existencia de empleados y servicios
      const parameters: any[] = [
        employeesSetIds.length,
        serviceTypeVehicleIds.length,
        employeesSetIds,
        serviceTypeVehicleIds,
      ];

      let existQuery = `
        SELECT 
          (SELECT COUNT(*) = $1 FROM employees WHERE "employeeId" = ANY($3) AND "active" = TRUE) AS "employeesExist",
          (SELECT COUNT(*) = $2 FROM services_type_vehicle WHERE "serviceTypeVehicleId" = ANY($4) AND "active" = TRUE) AS "servicesExist"
      `;

      if (combosSetIds.length > 0) {
        existQuery += `, (SELECT COUNT(*) = $5 FROM combos WHERE "comboId" = ANY($6)) AS "combosExist"`;
        parameters.push(combosSetIds.length, combosSetIds);
      }

      const isExistDataSale = (await queryRunner.manager.query(existQuery, parameters))[0];

      console.log('Validación de existencia:', isExistDataSale);

      if (
        !isExistDataSale.employeesExist ||
        !isExistDataSale.servicesExist ||
        (combosSetIds.length > 0 && !isExistDataSale.combosExist)
      ) {
        throw new NotFoundException('No se encontraron empleados, servicios o combos registrados');
      }

      /**
       * CÁLCULO DE PRECIOS DE LOS ITEMS
       */
      const items = await Promise.all(
        convertedServices.map(async (service) => {
          let query: string;
          let params: any[];
          let salePrice: number;

          if (service.comboOriginId) {
            // Precio con descuento de combo
            query = `
              WITH CalculatedPrices AS (
                SELECT 
                  s."serviceTypeVehicleId",
                  c."comboId",
                  c."discountPercentage",
                  ROUND(s.price * (1 - (c."discountPercentage" / 100.0)), 2) AS "priceUnitByCombo"
                FROM services_type_vehicle s
                INNER JOIN combos_services cs ON cs."serviceId" = s."serviceId"
                INNER JOIN combos c ON cs."comboId" = c."comboId"
                WHERE s."serviceTypeVehicleId" = $2
                  AND c."comboId" = $3
              )
              SELECT 
                ROUND("priceUnitByCombo" * (1 - ($1 / 100.0)), 2) AS "salePrice",
                "discountPercentage"
              FROM CalculatedPrices;
            `;
            params = [service.discount ?? 0, service.serviceTypeVehicleId, service.comboOriginId];
          } else {
            // Precio normal con descuento adicional
            query = `
              SELECT ROUND(price - (price * $1) / 100, 2) AS "salePrice" 
              FROM services_type_vehicle
              WHERE "serviceTypeVehicleId" = $2
            `;
            params = [service.discount ?? 0, service.serviceTypeVehicleId];
          }

          const result = await queryRunner.manager.query(query, params);
          salePrice = result[0].salePrice;

          return {
            saleId: sale.saleId,
            serviceTypeVehicleId: service.serviceTypeVehicleId,
            comboOriginId: service.comboOriginId ?? null,
            salePrice: salePrice,
            discount: service.discount ?? 0,
          };
        }),
      );

      // Eliminar duplicados
      const uniqueItems = Object.values(
        items.reduce(
          (acc, item) => {
            const key = `${item.serviceTypeVehicleId}_${item.comboOriginId || 'nocomb'}`;
            if (!acc[key]) {
              acc[key] = item;
            }
            return acc;
          },
          {} as Record<string, any>,
        ),
      );

      console.log('Items calculados:', uniqueItems);

      /**
       * CREACIÓN DE SALES_ITEMS
       */
      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('sales_items')
        .values(uniqueItems)
        .returning('*')
        .execute();

      const savedItems = insertResult.raw;
      console.log('Items guardados:', savedItems);

      /**
       * CREACIÓN DE SERVICES_ASSIGNMENTS
       */
      const servicesAssignments = savedItems
        .map((item: any) => {
          const serviceFound = convertedServices.find((s) => s.serviceTypeVehicleId === item.serviceTypeVehicleId);

          if (serviceFound) {
            return {
              saleItemId: item.saleItemId,
              employeeId: serviceFound.employeeId,
              notes: serviceFound.notes ?? null,
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log('Asignaciones a crear:', servicesAssignments);

      const insertServicesAssignmentsResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('services_assignments', ['saleItemId', 'employeeId', 'notes'])
        .values(servicesAssignments)
        .returning('*')
        .execute();

      const servicesAssignmentsResultMap = insertServicesAssignmentsResult.raw;
      console.log('Asignaciones creadas:', servicesAssignmentsResultMap);

      /**
       * CREACIÓN DE COMISIONES
       */
      const saleItemIds = servicesAssignmentsResultMap.map((item: any) => item.saleItemId);

      const commissions = await queryRunner.manager.query(
        `
        SELECT
          sa."serviceAssigmentId",
          ROUND((si."salePrice" * s."comissionPercentage" / 100), 2) AS "conmissionTotal"
        FROM services s
        INNER JOIN services_type_vehicle stv ON s."serviceId" = stv."serviceId"
        INNER JOIN sales_items si ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
        INNER JOIN services_assignments sa ON sa."saleItemId" = si."saleItemId"
        WHERE sa."saleItemId" = ANY($1)
        `,
        [saleItemIds],
      );

      console.log('Comisiones calculadas:', commissions);

      if (commissions.length > 0) {
        const createdCommissions = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('commissions', ['serviceAssigmentId', 'conmissionTotal'])
          .values(commissions)
          .returning('*')
          .execute();

        console.log('Comisiones creadas:', createdCommissions.raw);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Venta creada exitosamente',
        saleId: sale.saleId,
        invoiceNumber: dataSale.invoiceNumber,
        items: savedItems.length,
        assignments: servicesAssignmentsResultMap.length,
        commissions: commissions.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en la creación de la venta:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: QueryDateDto) {
    const { limit = 10, page = 1, param, endDate, startDate } = paginationDto;

    // 1. Condiciones de filtro
    const upperParam = param ? String(param).toUpperCase() : null;

    const buildWhereClause = (qb: SelectQueryBuilder<any>) => {
      if (upperParam) {
        if (['P', 'C', 'W'].includes(upperParam)) {
          qb.andWhere('sale.statusSale = :statusSale', { statusSale: upperParam });
        } else {
          qb.leftJoin('sale.client', 'clientForParam');
          qb.andWhere('clientForParam.ci ILIKE :ci', { ci: `%${upperParam}%` });
        }
      }
      if (startDate && endDate) {
        qb.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }
    };

    // 2. Contadores de estados (TOTALES GLOBALES, sin filtros)
    const qbCountGlobal = this.salesRepository.createQueryBuilder('sale');

    const rawCounts = await qbCountGlobal
      .select('sale.statusSale', 'status')
      .addSelect('COUNT(sale.saleId)', 'total')
      .groupBy('sale.statusSale')
      .getRawMany();

    const statusCounts = {
      Pagadas: 0,
      Canceladas: 0,
      EnEspera: 0,
    };
    rawCounts.forEach((row: { status: string; total: string }) => {
      const count = parseInt(row.total, 10);
      switch (row.status) {
        case 'P':
          statusCounts.Pagadas = count;
          break;
        case 'C':
          statusCounts.Canceladas = count;
          break;
        case 'W':
          statusCounts.EnEspera = count;
          break;
      }
    });

    // 3. Consulta principal paginada
    const qbMain = this.salesRepository.createQueryBuilder('sale');
    buildWhereClause(qbMain);

    qbMain
      .leftJoinAndSelect('sale.client', 'client')
      .leftJoinAndSelect('sale.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.typeVehicle', 'typeVehicle')
      .leftJoinAndSelect('sale.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('sale.salesItems', 'salesItem')
      .leftJoinAndSelect('salesItem.servicesTypeVehicle', 'stv')
      .leftJoinAndSelect('stv.service', 'service')
      .leftJoinAndSelect('stv.typeVehicle', 'stvTypeVehicle')
      .leftJoinAndSelect('salesItem.comboOrigin', 'combo')
      .leftJoinAndSelect('salesItem.serviceAssigment', 'assignment')
      .leftJoinAndSelect('assignment.employee', 'employee')
      .leftJoinAndSelect('assignment.union', 'commission')
      .orderBy('sale.saleDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [sales, total] = await qbMain.getManyAndCount();

    // 4. Transformar datos
    const data = sales.map((sale) => {
      // Venta base
      const baseSale = {
        saleId: sale.saleId,
        saleDate: sale.saleDate,
        statusSale: sale.statusSale,
        statusWashing: sale.statusWashing,
        initialState: sale.initialState,
        paymentMethod: sale.paymentMethod?.name,
        invoiceNumber: sale.invoiceNumber,
      };

      // Cliente
      const client = {
        names: sale.client?.names,
        lastnames: sale.client?.lastnames,
        numberPhone: sale.client?.numberPhone,
        ci: sale.client?.ci,
      };

      // Vehículo
      const vehicle = {
        vehicleId: sale.vehicle?.vehicleId,
        plate: sale.vehicle?.plate,
        typeVehicle: sale.vehicle?.typeVehicle?.name,
      };

      // Agrupar items
      const comboGroups = new Map<number, any>();
      const independentServices: any[] = [];
      let totalAmount = 0;

      (sale.salesItems || []).forEach((item) => {
        const itemPrice = Number(item.salePrice) || 0;
        totalAmount += itemPrice;

        // Como es un array, tomamos la primera asignación (única en tu lógica)
        const assignment = item.serviceAssigment?.[0];

        const baseItem = {
          serviceName: item.servicesTypeVehicle?.service?.name,
          typeVehicle: item.servicesTypeVehicle?.typeVehicle?.name,
          basePrice: item.servicesTypeVehicle?.price,
          discount: item.discount,
          salePrice: itemPrice,
          employee: assignment?.employee
            ? {
                names: assignment.employee.names,
                lastnames: assignment.employee.lastnames,
                numberPhone: assignment.employee.numberPhone,
                ci: assignment.employee.ci,
              }
            : null,
          notes: assignment?.notes || null,
          commission: assignment?.union?.conmissionTotal ?? 0,
        };

        if (item.comboOriginId) {
          const group = comboGroups.get(item.comboOriginId);
          if (group) {
            group.services.push(baseItem);
          } else {
            comboGroups.set(item.comboOriginId, {
              comboName: item.comboOrigin?.name,
              isPromotion: item.comboOrigin?.isPromotion,
              expirationDate: item.comboOrigin?.expirationDate,
              services: [baseItem],
            });
          }
        } else {
          independentServices.push(baseItem);
        }
      });

      const details = {
        comboServices: Array.from(comboGroups.values()),
        independentServices,
        totalAmount: Math.round(totalAmount * 100) / 100,
      };

      return { sale: baseSale, client, vehicle, details };
    });

    // 5. Respuesta final
    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      statusCounts, // <-- aquí van los contadores, fuera de meta (si prefieres dentro, lo mueves)
    };
  }

  async updateStatusWashing(id: number, updateSaleStatusWashingDto: UpdateSaleStatusWashingDto) {
    // Validamos que la venta exista
    const isExistsData = await this.salesRepository.findOne({
      select: ['saleId', 'statusWashing'],
      where: { saleId: id },
    });
    if (!isExistsData) {
      throw new NotFoundException('No existe una venta con el id proporcionado');
    }

    // VAlidamos el estado de lavado registrada en la DB
    if (isExistsData.statusWashing === StatusWashing.DONE || isExistsData.statusWashing === StatusWashing.CANCELLED) {
      throw new ConflictException('Solo se puede cambiar el estado de las ventas que esten en Pendiente o En progreso');
    }

    // Si el estado del dto es cancelado, Eliminamos en cascada
    if (updateSaleStatusWashingDto.statusWashing === StatusWashing.CANCELLED) {
      await this.canceledSale(id);
    } else {
      await this.salesRepository.update(id, {
        statusWashing: updateSaleStatusWashingDto.statusWashing as StatusWashing,
      });
    }

    return;
  }

  async updateStatusPaymentSale(id: number, updateSaleStatusPaymentDto: UpdateSaleStatusPaymentDto) {
    // Validamos que la venta exista
    const isExistsData = await this.salesRepository.findOne({
      select: ['saleId', 'statusSale'],
      where: { saleId: id },
    });
    if (!isExistsData) {
      throw new NotFoundException('No existe una venta con el id proporcionado');
    }

    // VAlidamos el estado de pago registrada en la DB
    if (isExistsData.statusSale === StatusPayments.PAID || isExistsData.statusSale === StatusPayments.CANCELLED) {
      throw new ConflictException('Solo se puede cambiar el estado de las ventas que esten en Pendiente o En progreso');
    }

    // Si el estado del dto es cancelado, Eliminamos en cascada
    if (updateSaleStatusPaymentDto.statusPayment === StatusPayments.CANCELLED) {
      await this.canceledSale(id);
    } else {
      await this.salesRepository.update(id, {
        statusSale: updateSaleStatusPaymentDto.statusPayment as StatusPayments,
      });
    }

    return;
  }

  private async canceledSale(id: number) {
    // Inicia una transacción
    await this.dataSource.transaction(async (manager) => {
      // 1. Cancelar la venta
      await this.salesRepository.update(id, {
        statusSale: StatusPayments.CANCELLED,
        statusWashing: StatusWashing.CANCELLED,
      });

      // 2. Cancelar las comisiones asociadas
      await manager.query(
        `
            UPDATE commissions c
            SET "statusPaymentConmission" = 'C',
                "updatedAt" = NOW()
            FROM services_assignments sa
            JOIN sales_items si ON si."saleItemId" = sa."saleItemId"
            WHERE c."serviceAssigmentId" = sa."serviceAssigmentId"
              AND si."saleId" = $1
        `,
        [id],
      );
    });

    console.log(`Se cancelo la venta de id: ${id}. Ademas de todas las comissiones pertenecientes a esta venta.`);
  }
}
