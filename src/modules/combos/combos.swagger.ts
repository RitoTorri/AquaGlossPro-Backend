import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiConflictResponse, ApiBadRequestResponse } from '@nestjs/swagger';

export function ApiCreateComboDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Crear un nuevo combo', description: 'Si `isPromotion` es true, la `expirationDate` es obligatoria y debe ser mayor a la fecha actual.' }),
        ApiCreatedResponse({ description: 'Combo creado exitosamente' }),
        ApiNotFoundResponse({ description: 'Recurso relacionado no encontrado' }),
        ApiConflictResponse({ description: 'Ya existe un combo con ese nombre' }),
        ApiBadRequestResponse({ description: 'Fecha de expiración inválida o faltante para promoción' }),
    );
}

export function ApiFindAllCombosDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todos los combos activos (los expirados se desactivan automáticamente)' }),
        ApiOkResponse({ description: 'Combos obtenidos exitosamente' }),
        ApiNotFoundResponse({ description: 'No hay combos registrados' }),
    );
}

export function ApiUpdateComboDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Actualizar un combo' }),
        ApiNoContentResponse({ description: 'Combo actualizado exitosamente' }),
        ApiNotFoundResponse({ description: 'Combo no encontrado' }),
        ApiConflictResponse({ description: 'Conflicto (nombre duplicado o combo inactivo)' }),
        ApiBadRequestResponse({ description: 'Fecha de expiración inválida' }),
    );
}

export function ApiRemoveComboDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Eliminar un combo (soft delete)' }),
        ApiNoContentResponse({ description: 'Combo eliminado exitosamente' }),
        ApiNotFoundResponse({ description: 'Combo no encontrado' }),
        ApiConflictResponse({ description: 'El combo ya está inactivo' }),
    );
}

export function ApiRestoreComboDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Restaurar un combo eliminado' }),
        ApiNoContentResponse({ description: 'Combo restaurado exitosamente' }),
        ApiNotFoundResponse({ description: 'Combo no encontrado' }),
        ApiConflictResponse({ description: 'El combo ya está activo' }),
    );
}