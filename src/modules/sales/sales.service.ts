import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository, ILike, SelectQueryBuilder } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleStatusWashingDto } from './dto/update-sale-status-washing.dto';
import { UpdateSaleStatusPaymentDto } from './dto/update-sale-status-payment.dto';
import { StatusPayments } from '../../shared/enums/status-payments.enum';
import { Sale } from './entities/sale.entity';
import { QueryDateDto } from '../../shared/dto/query.date.dto';
import { StatusWashing } from '../../shared/enums/status.washing';
import { generateInvoiceNumber } from '../../shared/utils/invoice_generate.utils';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    let { services, ...rest } = createSaleDto;
    console.log(rest);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // Inicio manual

    try {
      /**
       * CREAMOS LA VENTA
       */

      // Verificamos que exista el clientId, vehicleID y paymentMethodID
      const isExistsData = await queryRunner.manager.query(
        `
        SELECT 
          (SELECT EXISTS(SELECT 1 FROM clients WHERE "clientId" = $1 AND "active" = TRUE)) AS "employeeId",
          (SELECT EXISTS(SELECT 1 FROM vehicles WHERE "vehicleId" = $2 AND "active" = TRUE AND "ownerId" = $1)) AS "vehicleId",
          (SELECT EXISTS(SELECT 1 FROM payments_methods WHERE "paymentMethodId" = $3 AND "active" = TRUE)) AS "paymentMethodId";
      `,
        [rest.clientId, rest.vehicleId, rest.paymentMethodId],
      );

      console.log('Resultado de la validacion de existencia de cliente, vehiculo y metodo de pago');
      console.log(isExistsData[0]);

      const { employeeId, vehicleId, paymentMethodId } = isExistsData[0];
      if (!employeeId || !vehicleId || !paymentMethodId) {
        throw new NotFoundException(
          'El cliente, vehículo o método de pago no existe. Verifique tambien que el cliente sea dueño del vehículo.',
        );
      }

      // Verificamos que el vehiculo no este en otra venta
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
      console.log('Resultado de la verificación de que el vehiculo no este en otra venta');
      console.log(isVehicleInSale[0]);

      if (!isVehicleInSale[0].disponible) {
        throw new ConflictException('El vehículo id:' + rest.vehicleId + ' esta en proceso de limpieza en otra venta.');
      }

      // Verficamos que el tipo de vehiculo del vehiculo enviado sea el
      // mismo que el tipo de vehiculo del servicio que se va a pagar

      // Extraer el typeVehicleId del vehiculo enviado
      const vehicleType = await queryRunner.manager.query(
        `SELECT "typeVehicleId" FROM vehicles WHERE "vehicleId" = $1 AND "active" = TRUE`,
        [rest.vehicleId],
      );

      if (!vehicleType.length) {
        throw new NotFoundException('El vehículo no existe o está inactivo.');
      }

      const typeVehicleId = vehicleType[0].typeVehicleId;

      // Extraer los serviceTypeVehicleId únicos del array services
      const serviceTypeVehicleIds = [...new Set(services?.map((s) => s.serviceTypeVehicleId))];

      if (serviceTypeVehicleIds.length > 0) {
        // Verificar que TODOS esos servicios correspondan al typeVehicleId del vehículo
        const validServices = await queryRunner.manager.query(
          `SELECT COUNT(*)::int = $1 AS "allValid"
     FROM services_type_vehicle
     WHERE "serviceTypeVehicleId" = ANY($2)
       AND "typeVehicleId" = $3`,
          [serviceTypeVehicleIds.length, serviceTypeVehicleIds, typeVehicleId],
        );

        if (!validServices[0]?.allValid) {
          throw new BadRequestException('Uno o más servicios no corresponden al tipo de vehículo de esta venta.');
        }
      }

      // Verificamos que el empleado no este en otra venta
      if (services) {
        for (const service of services) {
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
              AND e."deletedAt" IS NULL; `,
            [service.employeeId],
          );

          console.log('Verificando disponibilidad de empleado:', isEmployeeInSale[0]);

          if (!isEmployeeInSale[0] || !isEmployeeInSale[0].disponible) {
            // Ahora sí, este throw detendrá la función, irá al catch,
            // hará el rollback y enviará la respuesta 409 a Swagger.
            throw new ConflictException(
              `El empleado id: ${isEmployeeInSale[0]?.employeeId} ${isEmployeeInSale[0]?.names || ''} está asignado en otra venta activa.`,
            );
          }
        }
      }

      // Creamos la venta
      const dataSale = { ...rest, invoiceNumber: generateInvoiceNumber() };
      console.log('Datos de la venta a guardar:');
      console.log(dataSale);
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

      console.log('Resultado de la creacion de la venta: ');
      console.log(sale);

      /**
       * CREAMOS LA DETALLES DE LA VENTA
       */

      // Extraemos los empleados de la venta
      const employeesSetIds = Array.from(new Set(services?.map((service) => service.employeeId)));
      console.log('Empleados que participan en la venta: ');
      console.log(employeesSetIds);

      // Expraemos los servicios id de la venta
      const servicesTypeVehicleIds = Array.from(new Set(services?.map((service) => service.serviceTypeVehicleId)));
      console.log('Servicios que participan en la venta: ');
      console.log(servicesTypeVehicleIds);

      // Extraemos los combos id de la venta, deduplicados
      const combosSetIds: number[] = [
        ...new Set(services?.map((s) => s.comboOriginId).filter((id): id is number => id != null)),
      ];

      console.log('Combos que participan en la venta (únicos): ', combosSetIds);

      // ==================== VALIDACIÓN DE COMBOS ====================
      if (combosSetIds.length > 0) {
        // 1. Información de combos (existencia, activo, expiración)
        const comboInfoQuery = `
          SELECT "comboId", "active", "expirationDate"
          FROM combos
          WHERE "comboId" = ANY($1)
        `;
        const combosInfo: Array<{
          comboId: number;
          active: boolean;
          expirationDate: string | null;
        }> = await queryRunner.manager.query(comboInfoQuery, [combosSetIds]);

        if (combosInfo.length !== combosSetIds.length) {
          throw new NotFoundException('Uno o más combos no existen.');
        }

        for (const combo of combosInfo) {
          if (!combo.active) {
            throw new BadRequestException(`El combo con ID ${combo.comboId} no está activo.`);
          }
          if (combo.expirationDate && new Date(combo.expirationDate) < new Date()) {
            throw new BadRequestException(`El combo con ID ${combo.comboId} ha expirado.`);
          }
        }

        // 2. Obtener todos los servicesTypeVehicleId que pertenecen a cada combo (activos)
        const comboServicesQuery = `
          SELECT cs."comboId", cs."servicesTypeVehicleId"
          FROM combos_services cs
          WHERE cs."comboId" = ANY($1) AND cs."active" = TRUE
        `;
        const comboServices: Array<{
          comboId: number;
          servicesTypeVehicleId: number;
        }> = await queryRunner.manager.query(comboServicesQuery, [combosSetIds]);

        // Agrupar servicios esperados por combo
        const expectedServicesMap = new Map<number, Set<number>>();
        for (const row of comboServices) {
          if (!expectedServicesMap.has(row.comboId)) {
            expectedServicesMap.set(row.comboId, new Set<number>());
          }
          expectedServicesMap.get(row.comboId)!.add(row.servicesTypeVehicleId);
        }

        // 3. Agrupar los servicios enviados que pertenecen a un combo
        const providedServicesMap = new Map<number, Set<number>>();
        for (const s of services ?? []) {
          const comboId = s.comboOriginId;
          if (comboId != null) {
            if (!providedServicesMap.has(comboId)) {
              providedServicesMap.set(comboId, new Set<number>());
            }
            providedServicesMap.get(comboId)!.add(s.serviceTypeVehicleId);
          }
        }

        // 4. Comparar que los servicios enviados sean exactamente los del combo
        for (const comboId of combosSetIds) {
          const expected = expectedServicesMap.get(comboId) ?? new Set<number>();
          const provided = providedServicesMap.get(comboId) ?? new Set<number>();

          const expectedArr = Array.from(expected).sort((a, b) => a - b);
          const providedArr = Array.from(provided).sort((a, b) => a - b);

          if (JSON.stringify(expectedArr) !== JSON.stringify(providedArr)) {
            throw new BadRequestException(
              `El combo "${comboId}" requiere exactamente los servicios: [${expectedArr.join(', ')}]. ` +
                `Recibidos: [${providedArr.join(', ')}].`,
            );
          }
        }
      }

      // ============ AQUÍ CONTINÚA EL RESTO DEL CÓDIGO ============

      const parameters: any[] = [
        employeesSetIds.length,
        servicesTypeVehicleIds.length,
        employeesSetIds,
        servicesTypeVehicleIds,
      ];
      console.log('Parametros iniciales: ');
      console.log(parameters);

      let query = `
       SELECT 
        (SELECT COUNT(*) = $1 FROM employees WHERE "employeeId" = ANY($3)) AS employees,
        (SELECT COUNT(*) = $2 FROM services_type_vehicle WHERE "serviceTypeVehicleId" = ANY($4)) AS services
      `;

      if (combosSetIds.length > 0) {
        query += `
          , (SELECT COUNT(*) = $5 FROM combos WHERE "comboId" = ANY($6)) AS combos;
        `;
        parameters.push(combosSetIds.length);
        parameters.push(combosSetIds);
      } else {
        query += `;`;
      }

      console.log('Query para verificar la existencia de empleados, combos y servicios: ');
      console.log(query);

      console.log('Parametros finales: ');
      console.log(parameters);

      // Verififcamos que existan los empleados, combos y servicios
      const isExistDataSale = (await queryRunner.manager.query(query, parameters))[0];

      console.log('Resultado de la verificación de existencia de empleados, combos y servicios: ');
      console.log(isExistDataSale);

      if (!isExistDataSale.employees || !isExistDataSale.services || isExistDataSale.combos === false) {
        throw new NotFoundException('No se encontraron empleados, servicios o combos registrados');
      }

      // Extraemos los precios de los servicios y establecer el precio de la venta por item
      const items = await Promise.all(
        (services ?? []).map(async (service) => {
          let query: string = '';
          let salePrice: number = 0;
          let param: any[] = [];

          if (service.comboOriginId) {
            /**
             * Se divide el combo por servicios unitarios y su descuento se aplica a cada servicio unitario
             */
            query += `
                WITH CalculatedPrices AS (
                  SELECT 
                      s."serviceTypeVehicleId",
                      c."comboId",
                      c."discountPercentage",
                      ROUND(s.price * (1 - (c."discountPercentage" / 100.0)), 2) AS "priceUnitByCombo"
                  FROM services_type_vehicle s
                  INNER JOIN combos_services cs ON cs."servicesTypeVehicleId" = s."serviceTypeVehicleId"
                  INNER JOIN combos c ON cs."comboId" = c."comboId"
                  WHERE s."serviceTypeVehicleId" = $2
                    AND c."comboId" = $3
              )
              SELECT 
                  ROUND("priceUnitByCombo" * (1 - ($1 / 100.0)), 2) AS "salePrice",
                  "discountPercentage"
              FROM CalculatedPrices;
            `;
            param = [service.discount ?? 0, service.serviceTypeVehicleId, service.comboOriginId];
          } else {
            query += `
              SELECT ROUND(price - (price * $1) / 100, 2) AS "salePrice" FROM services_type_vehicle
              WHERE "serviceTypeVehicleId" = $2
            `;
            param = [service.discount ?? 0, service.serviceTypeVehicleId];
          }

          salePrice = (await queryRunner.manager.query(query, param))[0].salePrice;
          return {
            saleId: sale.saleId,
            serviceTypeVehicleId: service.serviceTypeVehicleId,
            comboOriginId: service.comboOriginId ?? null,
            salePrice: salePrice,
            discount: service.discount ?? 0,
          };
        }),
      );

      // Eliminamos duplicados en caso de que existan
      const uniqueItems = Object.values(
        items.reduce((acc, item) => {
          if (!acc[item.serviceTypeVehicleId]) {
            acc[item.serviceTypeVehicleId] = item;
          }
          return acc;
        }, {}),
      );

      console.log('Precios de los servicios: ');
      console.log(uniqueItems);

      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('sales_items')
        .values(uniqueItems)
        .returning('*')
        .execute();

      const savedItems = insertResult.raw;
      console.log('Items guardados en la venta:', savedItems);

      /*
        CREAMOS EL SERVICES_ASSIGNMENTS
      */

      /* 
        Verificacamos que el servicios por tipo de vehiculo sea el mismo tanto para services como para items, 
        para asignar los id de manera correcta 
      */
      const servicesAssignments = savedItems.map((item) => {
        const serviceFound = services?.find((s) => s.serviceTypeVehicleId === item.serviceTypeVehicleId);
        if (serviceFound) {
          return {
            saleItemId: item.saleItemId,
            employeeId: serviceFound.employeeId,
            notes: serviceFound.notes ?? null,
          };
        }
      });

      console.log('Services assignments mapeados: ');
      console.log(servicesAssignments);

      // Creamos el servicios_assignments
      const insertServicesAssignmentsResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('services_assignments', ['saleItemId', 'employeeId', 'notes'])
        .values(servicesAssignments)
        .returning('*')
        .execute();
      const servicesAssignmentsResultMap = insertServicesAssignmentsResult.raw.map((item) => item.saleItemId);

      console.log('Resultado de el mapeo de servicios_assignments: ');
      console.log(servicesAssignmentsResultMap);

      /**
       * CREAMOS LAS COMISIONES
       */
      const searchTest = await queryRunner.manager.query(
        `
        SELECT
          sa."serviceAssigmentId",
          ROUND((si."salePrice" * s."comissionPercentage" / 100), 2) AS "conmissionTotal"
        FROM services s
        INNER JOIN services_type_vehicle stv ON s."serviceId" = stv."serviceId"
        INNER JOIN sales_items si ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
        INNER JOIN services_assignments sa ON sa."saleItemId" =  si."saleItemId"
        WHERE sa."saleItemId" = ANY($1)
      `,
        [servicesAssignmentsResultMap],
      );

      console.log('Buscamos comisiones de los servicios prestados: ');
      console.log(searchTest);

      // Creamos la comision para guardar en la DB
      const comisions = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('commissions', ['serviceAssigmentId', 'conmissionTotal'])
        .values(searchTest)
        .returning('*')
        .execute();

      console.log('Comisiones guardadas en la DB: ');
      console.log(comisions);

      await queryRunner.commitTransaction();
      return 'Se creo tu fucking venta.';
    } catch (error) {
      await queryRunner.rollbackTransaction();
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
        invoiceNumber: sale.invoiceNumber
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
