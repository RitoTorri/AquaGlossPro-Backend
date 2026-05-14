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
            `SELECT COUNT(*) as count FROM sales WHERE saledate >= $1 AND statussale = $2`,
            [today, 'G']
        );
        return { count: parseInt(result[0]?.count || 0) };
    }

    async getMostUsedPaymentMethod(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT paymentmethodid, COUNT(*) as count
             FROM sales
             WHERE saledate BETWEEN $1 AND $2 AND statussale = $3
             GROUP BY paymentmethodid
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;
        const pm = await this.dataSource.query(
            `SELECT name FROM payment_methods WHERE paymentmethodid = $1`,
            [result[0].paymentmethodid]
        );
        return {
            paymentMethodId: result[0].paymentmethodid,
            name: pm[0]?.name || 'Desconocido',
            count: parseInt(result[0].count),
        };
    }

    async getMostFrequentVehicleType(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT v.typevehicleid, COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s.vehicleid = v.vehicleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3
             GROUP BY v.typevehicleid
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;
        const tv = await this.dataSource.query(
            `SELECT name FROM typevehicle WHERE typevehicleid = $1`,
            [result[0].typevehicleid]
        );
        return {
            typeVehicleId: result[0].typevehicleid,
            name: tv[0]?.name || 'Desconocido',
            count: parseInt(result[0].count),
        };
    }

    async getMostUsedProduct(dateRange: DateRangeDto): Promise<any> {
        const { start, end } = this.getDateRange(dateRange);
        const result = await this.dataSource.query(
            `SELECT s.serviceid, s.name, COUNT(*) as count
             FROM sales_details sd
             JOIN services_type_vehicle stv ON sd.servicetypevehicleid = stv.servicetypevehicleid
             JOIN services s ON stv.serviceid = s.serviceid
             JOIN sales sa ON sd.saleid = sa.saleid
             WHERE sa.saledate BETWEEN $1 AND $2 AND sa.statussale = $3
             GROUP BY s.serviceid, s.name
             ORDER BY count DESC
             LIMIT 1`,
            [start, end, 'G']
        );
        if (!result.length) return null;
        return {
            serviceId: result[0].serviceid,
            name: result[0].name,
            count: parseInt(result[0].count),
        };
    }

    // ==================== REPORTES CON FILTROS ====================

    async getSalesByPaymentMethod(dateRange: DateRangeDto): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT s.paymentmethodid, SUM(sd.saleprice) as total
             FROM sales s
             JOIN sales_details sd ON s.saleid = sd.saleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3
             GROUP BY s.paymentmethodid`,
            [start, end, 'G']
        );
        const result: { paymentMethodId: number; name: string; total: number }[] = [];
        for (const row of rows) {
            const pm = await this.dataSource.query(
                `SELECT name FROM payment_methods WHERE paymentmethodid = $1`,
                [row.paymentmethodid]
            );
            result.push({
                paymentMethodId: row.paymentmethodid,
                name: pm[0]?.name || 'Desconocido',
                total: parseFloat(row.total),
            });
        }
        return result;
    }

    async getTopServices(dateRange: DateRangeDto, limit: number = 7): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT s.serviceid, s.name, COUNT(*) as count
             FROM sales_details sd
             JOIN services_type_vehicle stv ON sd.servicetypevehicleid = stv.servicetypevehicleid
             JOIN services s ON stv.serviceid = s.serviceid
             JOIN sales sa ON sd.saleid = sa.saleid
             WHERE sa.saledate BETWEEN $1 AND $2 AND sa.statussale = $3
             GROUP BY s.serviceid, s.name
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            serviceId: r.serviceid,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getFrequentVehicleTypes(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT tv.typevehicleid, tv.name, COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s.vehicleid = v.vehicleid
             JOIN typevehicle tv ON v.typevehicleid = tv.typevehicleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3
             GROUP BY tv.typevehicleid, tv.name
             ORDER BY count DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            typeVehicleId: r.typevehicleid,
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
            `SELECT e.employeeid, e.names, e.lastnames, SUM(c.comissiontotal) as "totalCommission"
             FROM commissions c
             JOIN services_assignments sa ON c.assignmentid = sa.assignmentid
             JOIN sales_details sd ON sa.saledetailid = sd.saledetailid
             JOIN sales s ON sd.saleid = s.saleid
             JOIN employees e ON sa.employeeid = e.employeeid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3 AND c.statuspaymentcomission = $4
             GROUP BY e.employeeid, e.names, e.lastnames
             ORDER BY "totalCommission" DESC
             LIMIT $5`,
            [start, end, 'G', 'G', limit]
        );
        return rows.map(r => ({
            employeeId: r.employeeid,
            fullName: `${r.names} ${r.lastnames}`,
            totalCommission: parseFloat(r.totalCommission),
        }));
    }

    async getTopEmployeesByVehiclesWashed(dateRange: DateRangeDto, limit: number = 10): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT e.employeeid, e.names, e.lastnames, COUNT(DISTINCT s.saleid) as "vehiclesWashed"
             FROM sales s
             JOIN sales_details sd ON s.saleid = sd.saleid
             JOIN services_assignments sa ON sd.saledetailid = sa.saledetailid
             JOIN employees e ON sa.employeeid = e.employeeid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3
             GROUP BY e.employeeid, e.names, e.lastnames
             ORDER BY "vehiclesWashed" DESC
             LIMIT $4`,
            [start, end, 'G', limit]
        );
        return rows.map(r => ({
            employeeId: r.employeeid,
            fullName: `${r.names} ${r.lastnames}`,
            vehiclesWashed: parseInt(r.vehiclesWashed),
        }));
    }

    async getTotalVehiclesByType(dateRange: DateRangeDto): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRange);
        const rows = await this.dataSource.query(
            `SELECT tv.typevehicleid, tv.name, COUNT(*) as count
             FROM sales s
             JOIN vehicles v ON s.vehicleid = v.vehicleid
             JOIN typevehicle tv ON v.typevehicleid = tv.typevehicleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3
             GROUP BY tv.typevehicleid, tv.name
             ORDER BY count DESC`,
            [start, end, 'G']
        );
        return rows.map(r => ({
            typeVehicleId: r.typevehicleid,
            name: r.name,
            count: parseInt(r.count),
        }));
    }

    async getOperationalClosure(dateRange: DateRangeDto): Promise<{ grossIncome: number; commissionsPaid: number; netIncome: number }> {
        const { start, end } = this.getDateRange(dateRange);
        const grossResult = await this.dataSource.query(
            `SELECT SUM(sd.saleprice) as total
             FROM sales s
             JOIN sales_details sd ON s.saleid = sd.saleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3`,
            [start, end, 'G']
        );
        const grossIncome = parseFloat(grossResult[0]?.total || 0);
        const commResult = await this.dataSource.query(
            `SELECT SUM(c.comissiontotal) as total
             FROM commissions c
             JOIN services_assignments sa ON c.assignmentid = sa.assignmentid
             JOIN sales_details sd ON sa.saledetailid = sd.saledetailid
             JOIN sales s ON sd.saleid = s.saleid
             WHERE s.saledate BETWEEN $1 AND $2 AND s.statussale = $3 AND c.statuspaymentcomission = $4`,
            [start, end, 'G', 'G']
        );
        const commissionsPaid = parseFloat(commResult[0]?.total || 0);
        return { grossIncome, commissionsPaid, netIncome: grossIncome - commissionsPaid };
    }
}