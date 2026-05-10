import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { DateRangeDto, Period } from './dto/date-range.dto';
import { ExportFormat } from './dto/export-format.dto';

@Injectable()
export class ReportsService {
    // ==================== UTILIDAD ====================
    private getDateRange(dateRangeDto: DateRangeDto): { start: Date; end: Date } {
        const { period, startDate, endDate } = dateRangeDto;
        const now = new Date();
        let start: Date;
        let end: Date = new Date(now);

        switch (period) {
            case Period.TODAY:
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case Period.WEEK:
                const day = now.getDay();
                const diffToMonday = day === 0 ? 6 : day - 1;
                start = new Date(now);
                start.setDate(now.getDate() - diffToMonday);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case Period.MONTH:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case Period.CUSTOM:
                if (!startDate || !endDate) {
                    throw new BadRequestException('Se requieren startDate y endDate cuando period = custom');
                }
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                throw new BadRequestException('Periodo no válido');
        }
        return { start, end };
    }

    // ==================== REPORTE 1: TOTAL GASTADO ====================
    async getTotalSpent(dateRangeDto: DateRangeDto): Promise<{ total: number }> {
        const { start, end } = this.getDateRange(dateRangeDto);
        // Reemplaza con consulta real cuando tengas la entidad Purchase
        // Ejemplo: SELECT SUM(total) FROM purchases WHERE created_at BETWEEN start AND end
        return { total: 15280.75 };
    }

    async exportTotalSpent(dateRangeDto: DateRangeDto, format: ExportFormat): Promise<Buffer> {
        const data = await this.getTotalSpent(dateRangeDto);
        const columns = ['Concepto', 'Monto (Bs)'];
        const rows = [['Total gastado en compras', data.total]];
        return this.generateReport(format, 'Total de compras', columns, rows);
    }

    // ==================== REPORTE 2: TOP PRODUCTOS COMPRADOS ====================
    async getTopPurchasedProducts(dateRangeDto: DateRangeDto, limit: number): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRangeDto);
        // Reemplaza con consulta real
        return [
            { productName: 'Shampoo', totalQuantity: 150 },
            { productName: 'Cera Líquida', totalQuantity: 98 },
            { productName: 'Desengrasante', totalQuantity: 75 },
            { productName: 'Acondicionador', totalQuantity: 60 },
            { productName: 'Silicona', totalQuantity: 42 },
        ].slice(0, limit);
    }

    async exportTopPurchasedProducts(dateRangeDto: DateRangeDto, format: ExportFormat): Promise<Buffer> {
        const data = await this.getTopPurchasedProducts(dateRangeDto, 10);
        const columns = ['Producto', 'Cantidad comprada'];
        const rows = data.map(item => [item.productName, item.totalQuantity]);
        return this.generateReport(format, 'Productos más comprados', columns, rows);
    }

    // ==================== REPORTE 3: COMPRAS POR PROVEEDOR ====================
    async getPurchasesBySupplier(dateRangeDto: DateRangeDto): Promise<any[]> {
        const { start, end } = this.getDateRange(dateRangeDto);
        // Reemplaza con consulta real
        return [
            { supplierName: 'Distribuidora Los Andes', totalSpent: 8500.00 },
            { supplierName: 'Importadora Automotriz', totalSpent: 4200.50 },
            { supplierName: 'Químicos Industriales CA', totalSpent: 2580.25 },
        ];
    }

    async exportPurchasesBySupplier(dateRangeDto: DateRangeDto, format: ExportFormat): Promise<Buffer> {
        const data = await this.getPurchasesBySupplier(dateRangeDto);
        const columns = ['Proveedor', 'Total gastado (Bs)'];
        const rows = data.map(item => [item.supplierName, item.totalSpent]);
        return this.generateReport(format, 'Compras por proveedor', columns, rows);
    }

    // ==================== GENERADORES ====================
    private async generateReport(format: ExportFormat, title: string, columns: string[], rows: any[][]): Promise<Buffer> {
        if (format === ExportFormat.PDF) {
            return this.generatePdf(title, columns, rows);
        } else {
            return this.generateExcel(title, columns, rows);
        }
    }

    private async generatePdf(title: string, columns: string[], rows: any[][]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                const buffers: Buffer[] = [];
                doc.on('data', chunks => buffers.push(chunks));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                doc.fontSize(18).text(title, { align: 'center' });
                doc.moveDown();
                doc.fontSize(10).text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' });
                doc.moveDown();

                const margin = 40;
                const pageWidth = doc.page.width;
                const availableWidth = pageWidth - margin * 2;
                const colWidth = availableWidth / columns.length;
                let y = 150;

                doc.font('Helvetica-Bold').fontSize(10);
                columns.forEach((col, i) => {
                    doc.text(col, margin + i * colWidth, y, { width: colWidth, align: 'left' });
                });
                y += 20;
                doc.font('Helvetica').fontSize(9);

                for (const row of rows) {
                    row.forEach((cell, i) => {
                        doc.text(String(cell), margin + i * colWidth, y, { width: colWidth, align: 'left' });
                    });
                    y += 20;
                    if (y > doc.page.height - 50) {
                        doc.addPage();
                        y = 150;
                        doc.font('Helvetica-Bold').fontSize(10);
                        columns.forEach((col, i) => {
                            doc.text(col, margin + i * colWidth, y, { width: colWidth, align: 'left' });
                        });
                        y += 20;
                        doc.font('Helvetica').fontSize(9);
                    }
                }
                doc.end();
            } catch (error) {
                console.error('Error generando PDF:', error);
                reject(error);
            }
        });
    }

    private async generateExcel(sheetName: string, columns: string[], rows: any[][]): Promise<Buffer> {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);
            worksheet.columns = columns.map(col => ({
                header: col,
                key: col.replace(/\s/g, '').toLowerCase(),
                width: 20,
            }));
            rows.forEach(row => {
                const rowObj = {};
                columns.forEach((col, idx) => {
                    const key = col.replace(/\s/g, '').toLowerCase();
                    rowObj[key] = row[idx];
                });
                worksheet.addRow(rowObj);
            });
            worksheet.getRow(1).font = { bold: true };
            const buffer = await workbook.xlsx.writeBuffer();
            return Buffer.from(buffer);
        } catch (error) {
            console.error('Error generando Excel:', error);
            throw error;
        }
    }
}