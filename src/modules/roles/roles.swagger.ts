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

function createRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo rol',
      description: 'Crea un nuevo rol en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Rol creado exitosamente' }),
    ApiConflictResponse({ description: 'El rol ya existe' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function findAllRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de roles',
      description: 'Obtiene la lista de roles',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Roles obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron roles registrados' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function updateRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un rol',
      description: 'Actualiza un rol en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Rol actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el rol con el id proporcionado' }),
    ApiConflictResponse({ description: 'El rol ya existe' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function deleteRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina un rol',
      description: 'Elimina un rol en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Rol eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el rol con el id proporcionado' }),
    ApiConflictResponse({ description: 'El rol ya esta inactivo. No puede ser eliminado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function restoreRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura un rol',
      description: 'Restaura un rol en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Rol restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el rol con el id proporcionado' }),
    ApiConflictResponse({ description: 'El rol ya esta activo. No puede ser restaurado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

export default {
  createRole,
  findAllRoles,
  updateRole,
  deleteRole,
  restoreRole,
};
