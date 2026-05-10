import { applyDecorators } from '@nestjs/common';
<<<<<<< HEAD
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
=======
import { ApiOperation, ApiCreatedResponse, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

export function ApiCreateComboDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo combo' }),
    ApiCreatedResponse({
      description: 'Combo creado exitosamente',
      schema: {
        example: {
          statusCode: 201,
          message: 'Combo creado exitosamente',
          data: {
            comboId: 1,
            name: 'COMBO LAVADO COMPLETO',
            discountPercentage: 15.5,
            isPromotion: true,
            expirationDate: '2025-12-31T23:59:59.000Z',
            active: true,
            createdAt: '2026-03-14T00:00:00.000Z',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'No se encontró algún recurso relacionado (si aplica)',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontró el recurso con el ID proporcionado',
        },
      },
    }),
    ApiConflictResponse({
      description: 'Ya existe un combo con ese nombre',
      schema: {
        example: {
          statusCode: 409,
          message: 'Ya existe un combo con ese nombre',
        },
      },
    }),
  );
}

export function ApiFindAllCombosDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar todos los combos' }),
    ApiOkResponse({
      description: 'Combos obtenidos exitosamente',
      schema: {
        example: {
          statusCode: 200,
          message: 'Combos obtenidos exitosamente',
          data: {
            data: [
              {
                comboId: 1,
                name: 'COMBO LAVADO COMPLETO',
                discountPercentage: 15.5,
                isPromotion: true,
                expirationDate: '2025-12-31T23:59:59.000Z',
                active: true,
                createdAt: '2026-03-14T00:00:00.000Z',
              },
            ],
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 10,
              totalPages: 1,
              currentPage: 1,
            },
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'No hay combos para mostrar',
      schema: {
        example: {
          statusCode: 404,
          message: 'No hay combos para mostrar',
        },
      },
    }),
  );
}

export function ApiUpdateComboDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un combo' }),
    ApiNoContentResponse({
      description: 'Combo actualizado exitosamente',
    }),
    ApiNotFoundResponse({
      description: 'No se encontró el combo con el ID proporcionado',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontró el combo con el ID proporcionado',
        },
      },
    }),
    ApiConflictResponse({
      description: 'El combo está inactivo o ya existe otro con ese nombre',
      schema: {
        example: {
          statusCode: 409,
          message: 'El combo está inactivo. No puede ser actualizado',
        },
      },
    }),
  );
}

export function ApiRemoveComboDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un combo (soft delete)' }),
    ApiNoContentResponse({
      description: 'Combo eliminado exitosamente',
    }),
    ApiNotFoundResponse({
      description: 'No se encontró el combo con el ID proporcionado',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontró el combo con el ID proporcionado',
        },
      },
    }),
    ApiConflictResponse({
      description: 'El combo ya está inactivo',
      schema: {
        example: {
          statusCode: 409,
          message: 'El combo ya está inactivo',
        },
      },
    }),
  );
}

export function ApiRestoreComboDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Restaurar un combo eliminado' }),
    ApiNoContentResponse({
      description: 'Combo restaurado exitosamente',
    }),
    ApiNotFoundResponse({
      description: 'No se encontró el combo con el ID proporcionado',
      schema: {
        example: {
          statusCode: 404,
          message: 'No se encontró el combo con el ID proporcionado',
        },
      },
    }),
    ApiConflictResponse({
      description: 'El combo ya está activo',
      schema: {
        example: {
          statusCode: 409,
          message: 'El combo ya está activo',
        },
      },
    }),
  );
>>>>>>> master
}