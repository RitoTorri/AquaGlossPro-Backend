import { applyDecorators } from '@nestjs/common/decorators';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

function createProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo producto', description: 'Crear un nuevo producto en la base de datos' }),
    ApiCreatedResponse({ description: 'Producto creado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
    ApiConflictResponse({ description: 'La categoría no está activa. No puede ser asignada a este producto' }),
  );
}

function findAllProductsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los productos',
      description: 'Obtener todos los productos registrados en la base de datos',
    }),
    ApiNoContentResponse({ description: 'Productos obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron productos' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
    ApiConflictResponse({ description: 'La categoría no está activa. No puede ser asignada a este producto' }),
  );
}

function updateProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un producto', description: 'Actualizar un producto en la base de datos' }),
    ApiNoContentResponse({ description: 'Producto actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el producto' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
  );
}

function restoreProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Restaurar un producto', description: 'Restaurar un producto en la base de datos' }),
    ApiNoContentResponse({ description: 'Producto restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el producto' }),
    ApiConflictResponse({ description: 'El producto ya está activo' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
  );
}

function removeProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un producto', description: 'Eliminar un producto en la base de datos' }),
    ApiNoContentResponse({ description: 'Producto eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el producto' }),
    ApiConflictResponse({ description: 'El producto ya está inactivo' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
  );
}

export default {
  createProductSwagger,
  findAllProductsSwagger,
  updateProductSwagger,
  restoreProductSwagger,
  removeProductSwagger,
};
