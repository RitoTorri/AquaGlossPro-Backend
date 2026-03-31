import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

function createSupplier() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo proveedor',
      description: 'Crea un nuevo proveedor en el sistema',
    }),
    ApiCreatedResponse({ description: 'Proveedor creado exitosamente' }),
    ApiConflictResponse({ description: 'RIF ya esta en uso o el email o phone ya estan en uso' }),
  );
}

function findAllSuppliers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de proveedores',
      description: 'Obtiene la lista de proveedores filtrados por nombres, RIF, estado o obtener todos.',
    }),
    ApiOkResponse({ description: 'Proveedores obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron proveedores' }),
  );
}

function updateSupplier() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un proveedor',
      description: 'Actualiza un proveedor en el sistema',
    }),
    ApiNoContentResponse({ description: 'Proveedor actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un proveedor con el ID proporcionado' }),
    ApiConflictResponse({ description: 'RIF ya esta en uso o el email o phone ya estan en uso' }),
    ApiConflictResponse({ description: 'Proveedor ya esta inactivo. No puede ser modificado' }),
  );
}

function deleteSupplier() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina un proveedor',
      description: 'Elimina un proveedor en el sistema',
    }),
    ApiNoContentResponse({ description: 'Proveedor eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un proveedor con el ID proporcionado' }),
    ApiConflictResponse({ description: 'Proveedor ya esta inactivo. No puede ser eliminado nuevamente.' }),
  );
}

function restoreSupplier() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura un proveedor',
      description: 'Restaura un proveedor en el sistema',
    }),
    ApiNoContentResponse({ description: 'Proveedor restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un proveedor con el ID proporcionado' }),
    ApiConflictResponse({ description: 'Proveedor ya esta activo. No puede ser restaurado nuevamente.' }),
  );
}

export default {
  createSupplier,
  findAllSuppliers,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
};
