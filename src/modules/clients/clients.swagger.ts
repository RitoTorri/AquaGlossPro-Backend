import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

function createClient() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo cliente',
      description: 'Crea un nuevo cliente en el sistema',
    }),
    ApiCreatedResponse({ description: 'Cliente creado exitosamente' }),
    ApiConflictResponse({ description: 'La cedula o rif proporcionado ya existe' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function findAllClients() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de clientes',
      description: 'Permite busqueda filtrada por nombres, apellidos, cedula y cedula - Rif',
    }),
    ApiOkResponse({ description: 'Clientes obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron clientes' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function updateClient() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un cliente',
      description: 'Actualiza un cliente en el sistema',
    }),
    ApiNoContentResponse({ description: 'Cliente actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el cliente con el id proporcionado' }),
    ApiConflictResponse({ description: 'La cedula o rif proporcionado ya existe' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function deleteClient() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina un cliente',
      description: 'Elimina un cliente en el sistema',
    }),
    ApiNoContentResponse({ description: 'Cliente eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el cliente con el id proporcionado' }),
    ApiConflictResponse({ description: 'El cliente está inactivo. No puede ser eliminado' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function restoreClient() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura un cliente',
      description: 'Restaura un cliente en el sistema',
    }),
    ApiNoContentResponse({ description: 'Cliente restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el cliente con el id proporcionado' }),
    ApiConflictResponse({ description: 'El cliente está activo. No puede ser restaurado' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

export default {
  createClient,
  findAllClients,
  updateClient,
  deleteClient,
  restoreClient,
};
