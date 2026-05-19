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

function createCategory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva categoría',
      description: 'Crea una nueva categoría en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Categoría creada exitosamente' }),
    ApiConflictResponse({ description: 'Nombre de la categoría ya existe' }),
    ApiNotFoundResponse({ description: 'Nombre de la categoría no encontrado' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function findAllCategories() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de categorías',
      description: 'Obtiene la lista de categorías filtradas por nombres, estado, tipo o todos.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Categorías obtenidas exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron categorías' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function updateCategory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza una categoría',
      description: 'Actualiza una categoría en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Categoría actualizada exitosamente' }),
    ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
    ApiConflictResponse({ description: 'Nombre de la categoría ya existe' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function deleteCategory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina una categoría',
      description: 'Elimina una categoría en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Categoría eliminada exitosamente' }),
    ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
    ApiConflictResponse({ description: 'Categoría ya esta inactiva. No puede ser eliminada nuevamente.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function restoreCategory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura una categoría',
      description: 'Restaura una categoría en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Categoría restaurada exitosamente' }),
    ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
    ApiConflictResponse({ description: 'Categoría ya esta activa. No puede ser restaurada nuevamente.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

export default {
  createCategory,
  findAllCategories,
  updateCategory,
  deleteCategory,
  restoreCategory,
};
