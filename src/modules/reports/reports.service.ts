import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto, Period } from './dto/date-range.dto';

@Injectable()
export class ReportsService {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // ==================== UTILIDAD ====================
    private getDateRange(dateRange: DateRangeDto): { start: Date; end: Date } {
        const { period, startDate, endDate } = dateRange;
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
                break;
            case Period.CUSTOM:
                if (!startDate || !endDate) {
                    throw new BadRequestException('Se requieren startDate y endDate cuando period = custom');
                }
                start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
        }
        return { start, end };
    }

    // ==================== TARJETAS ====================

    async getTotalServicesToday(): Promise<{ count: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await this.dataSource.query(
            `SELECT COUNT(*) as count FROM sales WHERE "saleDate" >= $1 AND "statusSale" = $2`,
            [today, 'G']
        );
        return { count: parseInt(result[0]?.count || 0) };
    }

    async getMostUsedPaymentMethod(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT "paymentMethodId", COUNT(*) as count
             FROM sales
             WHERE "saleDate" BETWEEN $1 AND $2 AND "statusSale" = $3
             GROUP BY "paymentMethodId"
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;

        const pmResult = await this.dataSource.query(
            `SELECT name FROM payment_methods WHERE "paymentMethodId" = $1`,
            [result[0].paymentMethodId]
        );
        const name = pmResult[0]?.name || 'Desconocido';

        return {
            paymentMethodId: result[0].paymentMethodId,
            name,
            count: parseInt(result[0].count),
        };
    }

    async getMostFrequentVehicleType(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT v."typeVehicleId", COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s."vehicleId" = v."vehicleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY v."typeVehicleId"
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;

        const tvResult = await this.dataSource.query(
            `SELECT name FROM "typeVehicle" WHERE "typeVehicleId" = $1`,
            [result[0].typeVehicleId]
        );
        const name = tvResult[0]?.name || 'Desconocido';

        return {
            typeVehicleId: result[0].typeVehicleId,
            name,
            count: parseInt(result[0].count),
        };
    }

    async getMostUsedProduct(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT s."serviceId", s.name, COUNT(*) as count
             FROM sales_details sd
             JOIN services_type_vehicle stv ON sd."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
             JOIN services s ON stv."serviceId" = s."serviceId"
             JOIN sales sa ON sd."saleId" = sa."saleId"
             WHERE sa."saleDate" BETWEEN $1 AND $2 AND sa."statusSale" = $3
             GROUP BY s."serviceId", s.name
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;
        return {
            serviceId: result[0].serviceId,
            name: result[0].name,
            count: parseInt(result[0].count),
        };
    }

    // ==================== REPORTES CON FILTROS ====================

    async getSalesByPaymentMethod(dateRange: DateRangeDto): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);

        // Obtener ventas con sus totales (suma de salePrice de sus detalles)
        const ventas = await this.dataSource.query(
            `SELECT sd."saleId", sd."paymentMethodId", SUM(sd2."salePrice") as total
             FROM sales sd
             JOIN sales_details sd2 ON sd."saleId" = sd2."saleId"
             WHERE sd."saleDate" BETWEEN $1 AND $2 AND sd."statusSale" = $3
             GROUP BY sd."saleId", sd."paymentMethodId"`,
            [start, end, 'G']
        );

        // Sumar por método de pago
        const map = new Map<number, { paymentMethodId: number; name: string; total: number }>();
        for (const venta of ventas) {
            const pmId = venta.paymentMethodId;
            if (!map.has(pmId)) {
                const pmResult = await this.dataSource.query(
                    `SELECT name FROM payment_methods WHERE "paymentMethodId" = $1`,
                    [pmId]
                );
                const name = pmResult[0]?.name || 'Desconocido';
                map.set(pmId, { paymentMethodId: pmId, name, total: 0 });
            }
            map.get(pmId)!.total += parseFloat(venta.total);
        }
        return Array.from(map.values());
    }

    async getTopServices(dateRange: DateRangeDto, limit: number = 7): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT s."serviceId", s.name, COUNT(*) as count
             FROM sales_details sd
             JOIN services_type_vehicle stv ON sd."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
             JOIN services s ON stv."serviceId" = s."serviceId"
             JOIN sales sa ON sd."saleId" = sa."saleId"
             WHERE sa."saleDate" BETWEEN $1 AND $2 AND sa."statusSale" = $3
             GROUP BY s."serviceId", s.name
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            serviceId: r.serviceId,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getFrequentVehicleTypes(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT tv."typeVehicleId", tv.name, COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s."vehicleId" = v."vehicleId"
             JOIN "typeVehicle" tv ON v."typeVehicleId" = tv."typeVehicleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY tv."typeVehicleId", tv.name
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            typeVehicleId: r.typeVehicleId,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getMostUsedProducts(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        return this.getTopServices(dateRange, limit);
    }

    async getTopEmployeesByCommission(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT e."employeeId", e.names, e.lastnames, SUM(c."comissionTotal") as "totalCommission"
             FROM commissions c
             JOIN services_assignments sa ON c."assignmentId" = sa."assignmentId"
             JOIN sales_details sd ON sa."saleDetailId" = sd."saleDetailId"
             JOIN sales s ON sd."saleId" = s."saleId"
             JOIN employees e ON sa."employeeId" = e."employeeId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3 AND c."statusPaymentComission" = $4
             GROUP BY e."employeeId", e.names, e.lastnames
             ORDER BY "totalCommission" DESC
             LIMIT $5`,
            [start, end, 'G', 'G', limit]
        );
        return rows.map(r => ({
            employeeId: r.employeeId,
            fullName: `${r.names} ${r.lastnames}`,
            totalCommission: parseFloat(r.totalCommission),
        }));
    }

    async getTopEmployeesByVehiclesWashed(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT e."employeeId", e.names, e.lastnames, COUNT(DISTINCT s."saleId") as "vehiclesWashed"
             FROM sales s
             JOIN sales_details sd ON s."saleId" = sd."saleId"
             JOIN services_assignments sa ON sd."saleDetailId" = sa."saleDetailId"
             JOIN employees e ON sa."employeeId" = e."employeeId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY e."employeeId", e.names, e.lastnames
             ORDER BY "vehiclesWashed" DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            employeeId: r.employeeId,
            fullName: `${r.names} ${r.lastnames}`,
            vehiclesWashed: parseInt(r.vehiclesWashed),
        }));
    }

    async getTotalVehiclesByType(dateRange: DateRangeDto): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT tv."typeVehicleId", tv.name, COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s."vehicleId" = v."vehicleId"
             JOIN "typeVehicle" tv ON v."typeVehicleId" = tv."typeVehicleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY tv."typeVehicleId", tv.name
             ORDER BY count DESC`,
            [start, end, 'G']
        );
        return rows.map(r => ({
            typeVehicleId: r.typeVehicleId,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getOperationalClosure(dateRange: DateRangeDto): Promise<{ grossIncome: number; commissionsPaid: number; netIncome: number }> {
        const { start, end } = this.getDateRange(dateRange);

        // Ingreso bruto
        const grossResult = await this.dataSource.query(
            `SELECT SUM(sd."salePrice") as total
             FROM sales s
             JOIN sales_details sd ON s."saleId" = sd."saleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3`,
            [start, end, 'G']
        );
        const grossIncome = parseFloat(grossResult[0]?.total || 0);

        // Comisiones pagadas
        const commResult = await this.dataSource.query(
            `SELECT SUM(c."comissionTotal") as total
             FROM commissions c
             JOIN services_assignments sa ON c."assignmentId" = sa."assignmentId"
             JOIN sales_details sd ON sa."saleDetailId" = sd."saleDetailId"
             JOIN sales s ON sd."saleId" = s."saleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3 AND c."statusPaymentComission" = $4`,
            [start, end, 'G', 'G']
        );
        const commissionsPaid = parseFloat(commResult[0]?.total || 0);

        return { grossIncome, commissionsPaid, netIncome: grossIncome - commissionsPaid };
    }
}