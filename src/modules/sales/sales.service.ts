import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly dataSource: DataSource) {}

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
          (SELECT EXISTS(SELECT 1 FROM clients WHERE "clientId" = $1)) AS "employeeId",
          (SELECT EXISTS(SELECT 1 FROM vehicles WHERE "vehicleId" = $2)) AS "vehicleId",
          (SELECT EXISTS(SELECT 1 FROM payments_methods WHERE "paymentMethodId" = $3)) AS "paymentMethodId";
      `,
        [rest.clientId, rest.vehicleId, rest.paymentMethodId],
      );

      console.log('Resultado de la validacion de existencia de cliente, vehiculo y metodo de pago');
      console.log(isExistsData[0]);

      const { employeeId, vehicleId, paymentMethodId } = isExistsData[0];
      if (!employeeId || !vehicleId || !paymentMethodId) {
        throw new NotFoundException('El cliente, vehículo o método de pago no existe');
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
            query += `
                SELECT 
                  ROUND(s.price * ROUND(1 - (c."discountPercentage"/100), 2)) AS "salePrice",
                  c."discountPercentage"
                FROM services_type_vehicle s
                INNER JOIN combos_services cs ON cs."servicesTypeVehicleId" = s."serviceTypeVehicleId"
                INNER JOIN combos c ON cs."comboId" = c."comboId"
                WHERE s."serviceTypeVehicleId" = $1
                AND c."comboId" = $2
            `;
            param = [service.serviceTypeVehicleId, service.comboOriginId];
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
        .returning(['saleItemId', 'serviceTypeVehicleId']) 
        .execute();

      const savedItems = insertResult.raw;
      console.log('Items guardados en la venta:', savedItems);


      await queryRunner.rollbackTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all sales`;
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }
}
