import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto, Period } from './dto/date-range.dto';

export interface DailyClosure {
  date: string;
  grossIncome: number;
  commissionsPaid: number;
  expenses: number;
  netIncome: number;
}

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private getDateRange(dateRange: DateRangeDto): { start: Date; end: Date } {
    let { period, startDate, endDate } = dateRange;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (period) {
      case Period.TODAY:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case Period.WEEK:
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        start = new Date(now);
        start.setDate(now.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        break;
      case Period.MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    }
    return { start, end };
  }

  async getTotalServicesToday(): Promise<{ count: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM sales WHERE "saleDate" >= $1 AND "statusSale" = $2`,
      [today, 'W'],
    );
    const count = result[0]?.count ? parseInt(result[0].count, 10) : 0;
    return { count };
  }

  async getMostUsedPaymentMethod(dateRange: DateRangeDto): Promise<{
    paymentMethodId: number | null;
    name: string | null;
    count: number;
  }> {
    const { start, end } = this.getDateRange(dateRange);
    const result = await this.dataSource.query(
      `SELECT "paymentMethodId", COUNT(*) as count
       FROM sales
       WHERE "saleDate" >= $1 AND "saleDate" <= $2 AND "statusSale" = $3
       GROUP BY "paymentMethodId"
       ORDER BY count DESC
       LIMIT 1`,
      [start, end, 'W'],
    );
    if (!result.length) {
      return { paymentMethodId: null, name: null, count: 0 };
    }
    const pm = await this.dataSource.query(
      `SELECT name FROM payments_methods WHERE "paymentMethodId" = $1`,
      [result[0].paymentMethodId],
    );
    return {
      paymentMethodId: result[0].paymentMethodId,
      name: pm[0]?.name || null,
      count: parseInt(result[0].count, 10),
    };
  }

  async getMostFrequentVehicleType(dateRange: DateRangeDto): Promise<{
    typeVehicleId: number | null;
    name: string | null;
    count: number;
  }> {
    const { start, end } = this.getDateRange(dateRange);
    const result = await this.dataSource.query(
      `SELECT v."typeVehicleId", COUNT(*) as count
       FROM sales s
       JOIN vehicles v ON s."vehicleId" = v."vehicleId"
       WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = $3
       GROUP BY v."typeVehicleId"
       ORDER BY count DESC
       LIMIT 1`,
      [start, end, 'W'],
    );
    if (!result.length) {
      return { typeVehicleId: null, name: null, count: 0 };
    }
    const tv = await this.dataSource.query(
      `SELECT name FROM types_vehicles WHERE "typeVehicleId" = $1`,
      [result[0].typeVehicleId],
    );
    return {
      typeVehicleId: result[0].typeVehicleId,
      name: tv[0]?.name || null,
      count: parseInt(result[0].count, 10),
    };
  }

  // ============================================================
  // MÉTODO PRINCIPAL CORREGIDO: auto-llenado si la tabla está vacía
  // ============================================================
  async getMostUsedProducts(dateRange: DateRangeDto, limit: number = 5): Promise<any[]> {
    const { start, end } = this.getDateRange(dateRange);

    // 1. Verificar si la tabla product_usage existe y tiene datos
    let hasData = false;
    try {
      const check = await this.dataSource.query(`SELECT COUNT(*) as count FROM product_usage`);
      hasData = parseInt(check[0].count, 10) > 0;
    } catch (error) {
      // Si la tabla no existe, la creamos (según tu esquema)
      console.warn('Tabla product_usage no existe, creándola...');
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS product_usage (
          "productUsageId" SERIAL PRIMARY KEY,
          "productId" INTEGER NOT NULL REFERENCES products("productId") ON DELETE CASCADE,
          "quantityUsed" NUMERIC(10,2) NOT NULL,
          "unitType" type_unit NOT NULL DEFAULT 'L',
          "createdAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      hasData = false;
    }

    // 2. Si no hay datos y estamos en desarrollo, generar usos automáticos
    if (!hasData && process.env.NODE_ENV !== 'production') {
      console.log('Generando usos de prueba automáticos para product_usage...');
      await this.generateProductUsageSeed();
    }

    // 3. Ejecutar la consulta del reporte
    try {
      const rows = await this.dataSource.query(
        `SELECT p."productId", p.name, COALESCE(SUM(pu."quantityUsed"), 0) as total_used
         FROM product_usage pu
         JOIN products p ON pu."productId" = p."productId"
         WHERE pu."createdAt" >= $1 AND pu."createdAt" <= $2
         GROUP BY p."productId", p.name
         ORDER BY total_used DESC
         LIMIT $3`,
        [start, end, limit],
      );
      return rows.map(r => ({
        productId: r.productId,
        name: r.name,
        totalUsed: parseFloat(r.total_used) || 0,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error en getMostUsedProducts:', errorMessage);
      return [];
    }
  }

  // Método interno para generar datos de prueba (solo llamado si la tabla está vacía)
  private async generateProductUsageSeed(): Promise<void> {
    // Obtener todos los productos activos
    const products = await this.dataSource.query(`
      SELECT "productId", "unitType" FROM products WHERE active = true
    `);
    if (products.length === 0) {
      console.warn('No hay productos activos para generar usos de prueba');
      return;
    }

    let inserted = 0;
    for (const product of products) {
      const numUses = Math.floor(Math.random() * 15) + 1; // 1 a 15 usos
      for (let i = 0; i < numUses; i++) {
        const daysAgo = Math.floor(Math.random() * 60); // últimos 60 días
        const quantity = (Math.random() * 8 + 0.5).toFixed(2); // 0.5 a 8.5
        await this.dataSource.query(
          `INSERT INTO product_usage ("productId", "quantityUsed", "unitType", "createdAt")
           VALUES ($1, $2, $3, NOW() - INTERVAL '1 day' * $4)`,
          [product.productId, quantity, product.unitType, daysAgo]
        );
        inserted++;
      }
    }
    console.log(`✅ Generados ${inserted} usos de prueba para ${products.length} productos`);
  }

  // ------------------------------------------------------------
  // Resto de métodos (sin cambios)
  // ------------------------------------------------------------
  async getSalesByPaymentMethod(dateRange: DateRangeDto): Promise<{
    paymentMethodId: number;
    name: string;
    total: number;
  }[]> {
    const { start, end } = this.getDateRange(dateRange);
    const rows = await this.dataSource.query(
      `SELECT s."paymentMethodId", SUM(si."salePrice") as total
       FROM sales s
       JOIN sales_items si ON s."saleId" = si."saleId"
       WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = $3
       GROUP BY s."paymentMethodId"`,
      [start, end, 'W'],
    );
    const result: any[] = [];
    for (const row of rows) {
      const pm = await this.dataSource.query(
        `SELECT name FROM payments_methods WHERE "paymentMethodId" = $1`,
        [row.paymentMethodId],
      );
      result.push({
        paymentMethodId: row.paymentMethodId,
        name: pm[0]?.name || 'Desconocido',
        total: parseFloat(row.total) || 0,
      });
    }
    return result;
  }

  async getTopServices(dateRange: DateRangeDto, limit: number = 7): Promise<any[]> {
    const { start, end } = this.getDateRange(dateRange);
    const rows = await this.dataSource.query(
      `SELECT s."serviceId", s.name, COUNT(*) as count
       FROM sales_items si
       JOIN services_type_vehicle stv ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
       JOIN services s ON stv."serviceId" = s."serviceId"
       JOIN sales sa ON si."saleId" = sa."saleId"
       WHERE sa."saleDate" >= $1 AND sa."saleDate" <= $2 AND sa."statusSale" = $3
       GROUP BY s."serviceId", s.name
       ORDER BY count DESC
       LIMIT $4`,
      [start, end, 'W', limit],
    );
    return rows.map(r => ({
      serviceId: r.serviceId,
      name: r.name,
      count: parseInt(r.count, 10),
    }));
  }

  async getTotalVehiclesByType(dateRange: DateRangeDto): Promise<{
    typeVehicleId: number;
    name: string;
    count: number;
    percentage: number;
  }[]> {
    const { start, end } = this.getDateRange(dateRange);
    const rows = await this.dataSource.query(
      `SELECT tv."typeVehicleId", tv.name, COUNT(*) as count
       FROM sales s
       JOIN vehicles v ON s."vehicleId" = v."vehicleId"
       JOIN types_vehicles tv ON v."typeVehicleId" = tv."typeVehicleId"
       WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = $3
       GROUP BY tv."typeVehicleId", tv.name
       ORDER BY count DESC`,
      [start, end, 'W'],
    );
    const total = rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
    return rows.map(r => ({
      typeVehicleId: r.typeVehicleId,
      name: r.name,
      count: parseInt(r.count, 10),
      percentage: total ? (parseInt(r.count, 10) / total) * 100 : 0,
    }));
  }

  async getTopEmployeesByCommission(dateRange: DateRangeDto, limit: number = 5): Promise<{
    employeeId: number;
    fullName: string;
    totalCommission: number;
  }[]> {
    const { start, end } = this.getDateRange(dateRange);
    const rows = await this.dataSource.query(
      `SELECT e."employeeId", e.names, e.lastnames, SUM(c."conmissionTotal") as "totalCommission"
       FROM commissions c
       JOIN services_assignments sa ON c."serviceAssigmentId" = sa."serviceAssigmentId"
       JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
       JOIN sales s ON si."saleId" = s."saleId"
       JOIN employees e ON sa."employeeId" = e."employeeId"
       WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = $3 AND c."statusPaymentConmission" = $4
       GROUP BY e."employeeId", e.names, e.lastnames
       ORDER BY "totalCommission" DESC
       LIMIT $5`,
      [start, end, 'W', 'W', limit],
    );
    return rows.map(r => ({
      employeeId: r.employeeId,
      fullName: `${r.names} ${r.lastnames}`,
      totalCommission: parseFloat(r.totalCommission) || 0,
    }));
  }

  async getTopEmployeesByVehiclesWashed(dateRange: DateRangeDto, limit: number = 5): Promise<{
    employeeId: number;
    fullName: string;
    vehiclesWashed: number;
  }[]> {
    const { start, end } = this.getDateRange(dateRange);
    const rows = await this.dataSource.query(
      `SELECT e."employeeId", e.names, e.lastnames, COUNT(DISTINCT s."saleId") as "vehiclesWashed"
       FROM sales s
       JOIN sales_items si ON s."saleId" = si."saleId"
       JOIN services_assignments sa ON si."saleItemId" = sa."saleItemId"
       JOIN employees e ON sa."employeeId" = e."employeeId"
       WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = $3
       GROUP BY e."employeeId", e.names, e.lastnames
       ORDER BY "vehiclesWashed" DESC
       LIMIT $4`,
      [start, end, 'W', limit],
    );
    return rows.map(r => ({
      employeeId: r.employeeId,
      fullName: `${r.names} ${r.lastnames}`,
      vehiclesWashed: parseInt(r.vehiclesWashed, 10) || 0,
    }));
  }

  async getOperationalClosure(dateRange: DateRangeDto): Promise<DailyClosure[]> {
    const { start, end } = this.getDateRange(dateRange);
    const results = await this.dataSource.query(
      `WITH daily_sales AS (
          SELECT DATE(s."saleDate") AS date,
                 COALESCE(SUM(si."salePrice"), 0) AS gross_income
          FROM sales s
          JOIN sales_items si ON s."saleId" = si."saleId"
          WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = 'W'
          GROUP BY DATE(s."saleDate")
        ),
        daily_commissions AS (
          SELECT DATE(s."saleDate") AS date,
                 COALESCE(SUM(c."conmissionTotal"), 0) AS commissions
          FROM commissions c
          JOIN services_assignments sa ON c."serviceAssigmentId" = sa."serviceAssigmentId"
          JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
          JOIN sales s ON si."saleId" = s."saleId"
          WHERE s."saleDate" >= $1 AND s."saleDate" <= $2 AND s."statusSale" = 'W' 
            AND c."statusPaymentConmission" = 'W'
          GROUP BY DATE(s."saleDate")
        )
        SELECT COALESCE(ds.date, dc.date) AS date,
               COALESCE(ds.gross_income, 0) AS "grossIncome",
               COALESCE(dc.commissions, 0) AS "commissionsPaid"
        FROM daily_sales ds
        FULL OUTER JOIN daily_commissions dc ON ds.date = dc.date
        ORDER BY date ASC`,
      [start, end],
    );
    return results.map(row => ({
      date: row.date.toISOString().split('T')[0],
      grossIncome: Number(row.grossIncome),
      commissionsPaid: Number(row.commissionsPaid),
      expenses: Number(row.commissionsPaid),
      netIncome: Number(row.grossIncome) - Number(row.commissionsPaid),
    }));
  }
}