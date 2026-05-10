import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiBadRequestResponse } from '@nestjs/swagger';

export class ReportsSwagger {
    static getTotalSpent() {
        return applyDecorators(
            ApiOperation({ summary: 'Total gastado en compras en el período' }),
            ApiOkResponse({ description: 'Monto total de compras.' }),
            ApiBadRequestResponse({ description: 'Parámetros inválidos.' }),
        );
    }

    static exportTotalSpent() {
        return applyDecorators(
            ApiOperation({ summary: 'Exportar total gastado en compras a PDF o Excel' }),
            ApiQuery({ name: 'format', enum: ['pdf', 'xlsx'], required: true }),
            ApiOkResponse({ description: 'Archivo exportado.' }),
        );
    }

    static getTopProducts() {
        return applyDecorators(
            ApiOperation({ summary: 'Top productos más comprados (cantidad)' }),
            ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de resultados (default 10)' }),
            ApiOkResponse({ description: 'Lista de productos con cantidades compradas.' }),
        );
    }

    static exportTopProducts() {
        return applyDecorators(
            ApiOperation({ summary: 'Exportar top productos comprados a PDF o Excel' }),
            ApiQuery({ name: 'format', enum: ['pdf', 'xlsx'], required: true }),
        );
    }

    static getBySupplier() {
        return applyDecorators(
            ApiOperation({ summary: 'Compras agrupadas por proveedor (monto total)' }),
            ApiOkResponse({ description: 'Lista de proveedores con montos gastados.' }),
        );
    }

    static exportBySupplier() {
        return applyDecorators(
            ApiOperation({ summary: 'Exportar compras por proveedor a PDF o Excel' }),
            ApiQuery({ name: 'format', enum: ['pdf', 'xlsx'], required: true }),
        );
    }
}