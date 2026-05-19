import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiBearerAuth } from '@nestjs/swagger';

function createRolePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crea un nuevo permiso para un rol',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Permiso creado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron permisos registrados' }),
    ApiConflictResponse({ description: 'Ya existe un permiso con este nombre' }),
  );
}

function updateRolePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un permiso de rol',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Permiso actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron permisos registrados' }),
    ApiConflictResponse({ description: 'Ya existe un permiso con este nombre' }),
  );
}

function findAllRolePermissions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de permisos de roles',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Roles permissions encontrados exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron permisos registrados' }),
  );
}

function restoreRolePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reasignar un permiso de rol',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Permiso reasignado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron permisos registrados' }),
    ApiConflictResponse({ description: 'El periso ya esta activado' }),
  );
}

function removeRolePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revocar un permiso de rol',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Permiso revocado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron permisos registrados' }),
    ApiConflictResponse({ description: 'El permiso ya esta eliminado' }),
  );
}

export default {
  createRolePermission,
  updateRolePermission,
  findAllRolePermissions,
  restoreRolePermission,
  removeRolePermission,
};
