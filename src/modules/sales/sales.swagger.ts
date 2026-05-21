import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

function createSale() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una venta',
      description: 'Crea una venta en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'La venta fue creada exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un cliente, vehiculo, combo o servicios con los id proporcionados' }),
    ApiBadRequestResponse({ description: 'Error en formato de datos' }),
  );
}

function updateStatusWashing() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar el estado de lavado de una venta',
      description: 'Actualiza el estado de lavado de una venta en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'La venta fue actualizada exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe una venta con el id proporcionado' }),
    ApiConflictResponse({ description: 'Solo se puede cambiar el estado de lavado de las ventas que esten en Pendiente o En progreso' }),
  );
}

function updateStatusPayment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar el estado de lavado de una venta',
      description: 'Actualiza el estado de lavado de una venta en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'La venta fue actualizada exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe una venta con el id proporcionado' }),
    ApiConflictResponse({ description: 'Solo se puede cambiar el estado de las ventas que esten en Pendiente' }),
  );
}

function findAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las ventas',
      description: 'Obtener todas las ventas en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Lista de ventas' }),
  );
}

export default {
  createSale,
  updateStatusWashing,
  updateStatusPayment,
  findAll,
};