import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function ApiCreateComboDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo combo',
      description:
        'Crea un nuevo combo en el sistema. Si es promoción, la fecha de expiración es obligatoria y debe ser futura.',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Combo creado exitosamente' }),
    ApiNotFoundResponse({ description: 'Recurso relacionado no encontrado' }),
    ApiConflictResponse({ description: 'Ya existe un combo con ese nombre' }),
    ApiBadRequestResponse({ description: 'Fecha de expiración inválida o faltante para promoción' }),
  );
}

export function ApiFindAllCombosDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de combos activos',
      description:
        'Obtiene la lista de combos activos. Los combos promocionales expirados se desactivan automáticamente.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Combos obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No hay combos para mostrar' }),
  );
}

export function ApiUpdateComboDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un combo',
      description: 'Actualiza un combo en el sistema.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Combo actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'Combo no encontrado' }),
    ApiConflictResponse({ description: 'El combo está inactivo o ya existe otro con ese nombre' }),
    ApiBadRequestResponse({ description: 'Fecha de expiración inválida' }),
  );
}

export function ApiRemoveComboDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un combo',
      description: 'Elimina (soft delete) un combo en el sistema.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Combo eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'Combo no encontrado' }),
    ApiConflictResponse({ description: 'El combo ya está inactivo' }),
  );
}

export function ApiRestoreComboDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaurar un combo eliminado',
      description: 'Restaura un combo previamente eliminado.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Combo restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'Combo no encontrado' }),
    ApiConflictResponse({ description: 'El combo ya está activo' }),
  );
}
