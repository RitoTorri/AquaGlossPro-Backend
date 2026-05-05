import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository, ILike } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { QueryDateDto } from '../../shared/dto/query.date.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const { services, ...rest } = createSaleDto;
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

      // Creamos la venta
      const sale = (
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('sales')
          .values(rest)
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

      // Expraemos los combos id de la venta
      const combosSetIds = [
        ...new Set(
          services?.map((s) => s.comboOriginId).filter((id) => id), // Esto elimina undefined y null
        ),
      ];
      console.log('Combos que participan en la venta: ');
      console.log(combosSetIds);

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

    // 1. Construir el objeto de condiciones (AND lógico)
    let where: any = {};

    if (param) {
      const upperParam = String(param).toUpperCase();
      if (['P', 'C', 'W'].includes(upperParam)) {
        // Si es un estado, filtramos por statusSale
        where.statusSale = upperParam;
      } else {
        // Si no es estado, buscamos por CI en la relación client
        where.client = { ci: ILike(`%${param}%`) };
      }
    }

    if (startDate && endDate) {
      // Si ya existe un filtro (por CI o Status), el Between se suma como AND
      where.saleDate = Between(startDate, endDate);
    }

    // 2. Usar findAndCount para obtener data y el total real
    const [sales, total] = await this.salesRepository.findAndCount({
      select: {
        saleId: true,
        saleDate: true,
        statusSale: true,
        statusWashing: true,
        initialState: true,
        client: {
          names: true,
          lastnames: true,
          numberPhone: true,
          ci: true,
        },
        vehicle: {
          vehicleId: true,
          plate: true,
          typeVehicle: { name: true },
        },
        paymentMethod: { name: true },
        salesItems: {
          saleItemId: true,
          servicesTypeVehicle: {
            service: { name: true },
            typeVehicle: { name: true },
            price: true,
          },
          comboOrigin: {
            name: true,
            isPromotion: true,
            expirationDate: true,
          },
          serviceAssigment: {
            serviceAssigmentId: true,
            employee: {
              names: true,
              lastnames: true,
              numberPhone: true,
              ci: true,
            },
            union: { conmissionTotal: true },
          },
          discount: true,
          salePrice: true,
        },
      },
      relations: {
        client: true,
        vehicle: { typeVehicle: true },
        salesItems: {
          comboOrigin: true,
          servicesTypeVehicle: {
            service: true,
            typeVehicle: true,
          },
          serviceAssigment: {
            employee: true,
            union: true,
          },
        },
        paymentMethod: true,
      },
      where: where, // Pasamos el objeto, no el arreglo
      take: limit,
      skip: (page - 1) * limit,
      order: { saleDate: 'DESC' },
      withDeleted: true,
    });

    // 3. Retornar con el formato de paginación
    return {
      data: sales,
      meta: {
        totalItems: total,
        itemCount: sales.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }
}
