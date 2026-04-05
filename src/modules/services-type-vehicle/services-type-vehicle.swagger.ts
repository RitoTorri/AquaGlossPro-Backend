import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';

export function ApiCreateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Crear una relación servicio-tipo vehículo' }),
        ApiCreatedResponse({ description: 'Relación creada exitosamente' }),
        ApiNotFoundResponse({ description: 'Servicio o tipo de vehículo no encontrado' }),
        ApiConflictResponse({ description: 'Ya existe una relación para ese servicio y tipo de vehículo' }),
    );
}

export function ApiFindAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todas las relaciones' }),
        ApiOkResponse({ description: 'Registros obtenidos exitosamente' }),
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
        ApiNoContentResponse({ description: 'Relación actualizada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'Conflicto (relación inactiva o duplicada)' }),
    );
}

export function ApiRestoreDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Restaurar una relación eliminada' }),
        ApiNoContentResponse({ description: 'Relación restaurada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'La relación ya está activa' }),
    );
}

export function ApiRemoveDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Eliminar una relación (soft delete)' }),
        ApiNoContentResponse({ description: 'Relación eliminada exitosamente' }),
        ApiNotFoundResponse({ description: 'Relación no encontrada' }),
        ApiConflictResponse({ description: 'La relación ya está inactiva' }),
    );
}