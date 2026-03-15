import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
} from '@nestjs/swagger';

export function ApiCreateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Crear una relación combo-servicio' }),
        ApiCreatedResponse({ description: 'Relación creada exitosamente' }),
        ApiNotFoundResponse({ description: 'Combo o servicio-tipo vehículo no encontrado' }),
        ApiConflictResponse({ description: 'La relación ya existe' }),
    );
}

export function ApiFindAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todas las relaciones combo-servicio' }),
        ApiOkResponse({ description: 'Relaciones obtenidas exitosamente' }),
        ApiNotFoundResponse({ description: 'No hay registros' }),
    );
}

export function ApiFindOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Obtener una relación por ID' }),
        ApiOkResponse({ description: 'Relación encontrada' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
    );
}

export function ApiUpdateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Actualizar una relación' }),
        ApiOkResponse({ description: 'Relación actualizada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'Conflicto (relación inactiva o duplicada)' }),
    );
}

export function ApiRestoreDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Restaurar una relación eliminada' }),
        ApiOkResponse({ description: 'Relación restaurada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'La relación ya está activa' }),
    );
}

export function ApiRemoveDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Eliminar una relación (soft delete)' }),
        ApiOkResponse({ description: 'Relación eliminada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'La relación ya está inactiva' }),
    );
}