import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse } from '@nestjs/swagger';

function createPurchase() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear una nueva compra',
            description: 'Crea una nueva compra en el sistema'
        }),
        ApiCreatedResponse({ description: 'Compra creada exitosamente' }),
        ApiConflictResponse({ description: 'Proveedor, método de pago o producto no encontrado' }),
    );
}

function findAllPurchases() {
    return applyDecorators(
        ApiOperation({
            summary: 'Lista de compras',
            description: 'Obtiene la lista de compras filtradas por fecha, proveedor, código de factura o cédula de proveedor.'
        }),
        ApiOkResponse({ description: 'Compras obtenidas exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontraron compras' })
    );
}

function updatePurchase() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualizar una compra',
            description: 'Actualiza una compra en el sistema. Solo se puede actualizar una compra con estado PENDING'
        }),
        ApiNoContentResponse({ description: 'Compra actualizada exitosamente' }),
        ApiNotFoundResponse({ description: 'Compra no encontrada o no existe' }),
        ApiConflictResponse({ description: 'El estado de la compra no es válido' })
    );
}

export default {
    createPurchase,
    findAllPurchases,
    updatePurchase,
};