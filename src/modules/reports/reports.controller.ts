import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { DateRangeDto } from './dto/date-range.dto';
import { ExportFormat } from './dto/export-format.dto';
import { ReportsSwagger } from './reports.swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly service: ReportsService) {}

    @Get('total-spent')
    @ReportsSwagger.getTotalSpent()
    async getTotalSpent(@Query() dateRange: DateRangeDto) {
        return this.service.getTotalSpent(dateRange);
    }

    @Get('top-products')
    @ReportsSwagger.getTopProducts()
    async getTopProducts(@Query() dateRange: DateRangeDto, @Query('limit') limit?: number) {
        return this.service.getTopPurchasedProducts(dateRange, limit || 10);
    }

    @Get('by-supplier')
    @ReportsSwagger.getBySupplier()
    async getBySupplier(@Query() dateRange: DateRangeDto) {
        return this.service.getPurchasesBySupplier(dateRange);
    }

    @Get('total-spent/export')
    @ReportsSwagger.exportTotalSpent()
    async exportTotalSpent(
        @Query() dateRange: DateRangeDto,
        @Query('format') format: ExportFormat,
        @Res() res: any,
    ) {
        const buffer = await this.service.exportTotalSpent(dateRange, format);
        const filename = `total_compras_${Date.now()}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === ExportFormat.PDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }

    @Get('top-products/export')
    @ReportsSwagger.exportTopProducts()
    async exportTopProducts(
        @Query() dateRange: DateRangeDto,
        @Query('format') format: ExportFormat,
        @Res() res: any,
    ) {
        const buffer = await this.service.exportTopPurchasedProducts(dateRange, format);
        const filename = `top_productos_compras_${Date.now()}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === ExportFormat.PDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }

    @Get('by-supplier/export')
    @ReportsSwagger.exportBySupplier()
    async exportBySupplier(
        @Query() dateRange: DateRangeDto,
        @Query('format') format: ExportFormat,
        @Res() res: any,
    ) {
        const buffer = await this.service.exportPurchasesBySupplier(dateRange, format);
        const filename = `compras_por_proveedor_${Date.now()}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === ExportFormat.PDF ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
}