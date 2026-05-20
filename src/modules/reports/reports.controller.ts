import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService, DailyClosure } from './reports.service';
import { DateRangeDto } from './dto/date-range.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('total-services-today')
  @ApiOperation({ summary: 'Total de servicios del día' })
  async getTotalServicesToday() {
    return this.reportsService.getTotalServicesToday();
  }

  @Get('most-used-payment-method')
  @ApiOperation({ summary: 'Método de pago más utilizado' })
  async getMostUsedPaymentMethod(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getMostUsedPaymentMethod(dateRange);
  }

  @Get('most-frequent-vehicle-type')
  @ApiOperation({ summary: 'Tipo de vehículo más frecuente' })
  async getMostFrequentVehicleType(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getMostFrequentVehicleType(dateRange);
  }

  @Get('most-used-products')
  @ApiOperation({ summary: 'Top productos más utilizados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMostUsedProducts(@Query() dateRange: DateRangeDto, @Query('limit') limit?: number) {
    return this.reportsService.getMostUsedProducts(dateRange, limit || 5);
  }

  @Get('sales-by-payment-method')
  @ApiOperation({ summary: 'Ventas por método de pago (montos)' })
  async getSalesByPaymentMethod(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getSalesByPaymentMethod(dateRange);
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Servicios más solicitados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopServices(@Query() dateRange: DateRangeDto, @Query('limit') limit?: number) {
    return this.reportsService.getTopServices(dateRange, limit || 7);
  }

  @Get('total-vehicles-by-type')
  @ApiOperation({ summary: 'Total de vehículos lavados por tipo' })
  async getTotalVehiclesByType(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getTotalVehiclesByType(dateRange);
  }

  @Get('top-employees-by-commission')
  @ApiOperation({ summary: 'Top empleados por comisiones' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopEmployeesByCommission(@Query() dateRange: DateRangeDto, @Query('limit') limit?: number) {
    return this.reportsService.getTopEmployeesByCommission(dateRange, limit || 5);
  }

  @Get('top-employees-by-vehicles-washed')
  @ApiOperation({ summary: 'Top empleados por vehículos lavados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopEmployeesByVehiclesWashed(@Query() dateRange: DateRangeDto, @Query('limit') limit?: number) {
    return this.reportsService.getTopEmployeesByVehiclesWashed(dateRange, limit || 5);
  }

  @Get('operational-closure')
  @ApiOperation({ summary: 'Cierre operativo diario (ingresos vs comisiones)' })
  async getOperationalClosure(@Query() dateRange: DateRangeDto): Promise<DailyClosure[]> {
    return this.reportsService.getOperationalClosure(dateRange);
  }
}