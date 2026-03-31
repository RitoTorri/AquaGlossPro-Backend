import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

function createPaymentMethod() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo método de pago',
      description: 'Permite crear un nuevo método de pago',
    }),
    ApiCreatedResponse({ description: 'Método de pago creado exitosamente' }),
    ApiConflictResponse({ description: 'El método de pago ya existe' }),
    ApiBadRequestResponse({ description: 'Datos invalidos o campos requeridos faltantes' }),
  );
}

function findPaymentsMethods() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los métodos de pago',
      description: 'Permite obtener todos los métodos de pago',
    }),
    ApiOkResponse({ description: 'Métodos de pago obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron métodos de pago' }),
    ApiBadRequestResponse({ description: 'Datos invalidos o campos requeridos faltantes' }),
  );
}

function updatePaymentMethod() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un método de pago',
      description: 'Permite actualizar un método de pago',
    }),
    ApiNoContentResponse({ description: 'Método de pago actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el método de pago con el id proporcionado' }),
    ApiConflictResponse({ description: 'El método de pago ya existe' }),
    ApiBadRequestResponse({ description: 'Datos invalidos o campos requeridos faltantes' }),
  );
}

function removePaymentMethod() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un método de pago',
      description: 'Permite eliminar un método de pago',
    }),
    ApiNoContentResponse({ description: 'Método de pago eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el método de pago con el id proporcionado' }),
    ApiConflictResponse({ description: 'El método de pago ya esta inactivo. No puede ser eliminado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Datos invalidos o campos requeridos faltantes' }),
  );
}

function restorePaymentMethod() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaurar un método de pago',
      description: 'Permite restaurar un método de pago',
    }),
    ApiOkResponse({ description: 'Método de pago restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el método de pago con el id proporcionado' }),
    ApiConflictResponse({ description: 'El método de pago ya esta activo. No puede ser restaurado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Datos invalidos o campos requeridos faltantes' }),
  );
}

export default {
  createPaymentMethod,
  findPaymentsMethods,
  updatePaymentMethod,
  removePaymentMethod,
  restorePaymentMethod,
};
