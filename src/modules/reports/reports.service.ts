import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto, Period } from './dto/date-range.dto';

@Injectable()
export class ReportsService {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

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
                    throw new BadRequestException('Se requieren startDate y endDate');
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
            [today, 'P']
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
            [start, end, 'P']
        );
        if (!result.length) return null;
        const pm = await this.dataSource.query(
            `SELECT "name" FROM payments_methods WHERE "paymentMethodId" = $1`,
            [result[0].paymentMethodId]
        );
        return {
            paymentMethodId: result[0].paymentMethodId,
            name: pm[0]?.name || 'Desconocido',
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
            [start, end, 'P']
        );
        if (!result.length) return null;
        const tv = await this.dataSource.query(
            `SELECT "name" FROM types_vehicles WHERE "typeVehicleId" = $1`,
            [result[0].typeVehicleId]
        );
        return {
            typeVehicleId: result[0].typeVehicleId,
            name: tv[0]?.name || 'Desconocido',
            count: parseInt(result[0].count),
        };
    }

    async getMostUsedProduct(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT s."serviceId", s."name", COUNT(*) as count
             FROM sales_items si
             JOIN services_type_vehicle stv ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
             JOIN services s ON stv."serviceId" = s."serviceId"
             JOIN sales sa ON si."saleId" = sa."saleId"
             WHERE sa."saleDate" BETWEEN $1 AND $2 AND sa."statusSale" = $3
             GROUP BY s."serviceId", s."name"
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'P']
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
        const rows = await this.dataSource.query(
            `SELECT s."paymentMethodId", SUM(si."salePrice") as total
             FROM sales s
             JOIN sales_items si ON s."saleId" = si."saleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY s."paymentMethodId"`,
            [start, end, 'P']
        );
        const result: { paymentMethodId: number; name: string; total: number }[] = [];
        for (const row of rows) {
            const pm = await this.dataSource.query(
                `SELECT "name" FROM payments_methods WHERE "paymentMethodId" = $1`,
                [row.paymentMethodId]
            );
            result.push({
                paymentMethodId: row.paymentMethodId,
                name: pm[0]?.name || 'Desconocido',
                total: parseFloat(row.total),
            });
        }
        return result;
    }

    async getTopServices(dateRange: DateRangeDto, limit: number = 7): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT s."serviceId", s."name", COUNT(*) as count
             FROM sales_items si
             JOIN services_type_vehicle stv ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
             JOIN services s ON stv."serviceId" = s."serviceId"
             JOIN sales sa ON si."saleId" = sa."saleId"
             WHERE sa."saleDate" BETWEEN $1 AND $2 AND sa."statusSale" = $3
             GROUP BY s."serviceId", s."name"
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'P', limit]
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
            `SELECT tv."typeVehicleId", tv."name", COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s."vehicleId" = v."vehicleId"
             JOIN types_vehicles tv ON v."typeVehicleId" = tv."typeVehicleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY tv."typeVehicleId", tv."name"
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'P', limit]
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
            `SELECT e."employeeId", e."names", e."lastnames", SUM(c."conmissionTotal") as "totalCommission"
             FROM commissions c
             JOIN services_assignments sa ON c."serviceAssigmentId" = sa."serviceAssigmentId"
             JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
             JOIN sales s ON si."saleId" = s."saleId"
             JOIN employees e ON sa."employeeId" = e."employeeId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3 AND c."statusPaymentConmission" = $4
             GROUP BY e."employeeId", e."names", e."lastnames"
             ORDER BY "totalCommission" DESC
             LIMIT $5`,
            [start, end, 'P', 'P', limit]
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
            `SELECT e."employeeId", e."names", e."lastnames", COUNT(DISTINCT s."saleId") as "vehiclesWashed"
             FROM sales s
             JOIN sales_items si ON s."saleId" = si."saleId"
             JOIN services_assignments sa ON si."saleItemId" = sa."saleItemId"
             JOIN employees e ON sa."employeeId" = e."employeeId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY e."employeeId", e."names", e."lastnames"
             ORDER BY "vehiclesWashed" DESC
             LIMIT $4`,
            [start, end, 'P', limit]
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
            `SELECT tv."typeVehicleId", tv."name", COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s."vehicleId" = v."vehicleId"
             JOIN types_vehicles tv ON v."typeVehicleId" = tv."typeVehicleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3
             GROUP BY tv."typeVehicleId", tv."name"
             ORDER BY count DESC`,
            [start, end, 'P']
        );
        return rows.map(r => ({
            typeVehicleId: r.typeVehicleId,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getOperationalClosure(dateRange: DateRangeDto): Promise<{ grossIncome: number; commissionsPaid: number; netIncome: number }> {
        const { start, end } = this.getDateRange(dateRange);
        const grossResult = await this.dataSource.query(
            `SELECT SUM(si."salePrice") as total
             FROM sales s
             JOIN sales_items si ON s."saleId" = si."saleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3`,
            [start, end, 'P']
        );
        const grossIncome = parseFloat(grossResult[0]?.total || 0);

        const commResult = await this.dataSource.query(
            `SELECT SUM(c."conmissionTotal") as total
             FROM commissions c
             JOIN services_assignments sa ON c."serviceAssigmentId" = sa."serviceAssigmentId"
             JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
             JOIN sales s ON si."saleId" = s."saleId"
             WHERE s."saleDate" BETWEEN $1 AND $2 AND s."statusSale" = $3 AND c."statusPaymentConmission" = $4`,
            [start, end, 'P', 'P']
        );
        const commissionsPaid = parseFloat(commResult[0]?.total || 0);
        return { grossIncome, commissionsPaid, netIncome: grossIncome - commissionsPaid };
    }
}