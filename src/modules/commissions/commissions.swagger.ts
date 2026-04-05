import { applyDecorators } from '@nestjs/common';
import { 
    ApiOperation, 
    ApiCreatedResponse, 
    ApiOkResponse, 
    ApiNotFoundResponse, 
    ApiConflictResponse 
} from '@nestjs/swagger';

export function ApiCreateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Crear una nueva comisión' }),
        ApiCreatedResponse({ description: 'Comisión creada exitosamente' }),
        ApiNotFoundResponse({ description: 'Empleado o detalle de venta no encontrado' }),
        ApiConflictResponse({ description: 'Ya existe una comisión para este detalle de venta' }),
    );
}

export function ApiFindAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todas las comisiones' }),
        ApiOkResponse({ description: 'Comisiones obtenidas exitosamente' }),
        ApiNotFoundResponse({ description: 'No hay registros' }),
    );
}

export function ApiFindOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Obtener una comisión por ID' }),
        ApiOkResponse({ description: 'Comisión encontrada' }),
        ApiNotFoundResponse({ description: 'Comisión no encontrada' }),
    );
}

export function ApiUpdateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Actualizar una comisión' }),
        ApiOkResponse({ description: 'Comisión actualizada exitosamente' }),
        ApiNotFoundResponse({ description: 'Comisión no encontrada' }),
        ApiConflictResponse({ description: 'La comisión está inactiva o ya existe' }),
    );
}

export function ApiRestoreDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Restaurar una comisión eliminada' }),
        ApiOkResponse({ description: 'Comisión restaurada exitosamente' }),
        ApiNotFoundResponse({ description: 'Comisión no encontrada' }),
        ApiConflictResponse({ description: 'La comisión ya está activa' }),
    );
}

export function ApiRemoveDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Eliminar una comisión (soft delete)' }),
        ApiOkResponse({ description: 'Comisión eliminada exitosamente' }),
        ApiNotFoundResponse({ description: 'Comisión no encontrada' }),
        ApiConflictResponse({ description: 'La comisión ya está inactiva' }),
    );
}