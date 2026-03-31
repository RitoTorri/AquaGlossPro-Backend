import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

function createUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo usuario',
      description: 'Crea un nuevo usuario en el sistema',
    }),
    ApiCreatedResponse({ description: 'Usuario creado exitosamente' }),
    ApiConflictResponse({ description: 'Email ya esta en uso o el rol esta inactivo o no existe' }),
    ApiNotFoundResponse({ description: 'Rol no encontrado' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function findAllUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de usuarios',
      description: 'Obtiene la lista de usuarios',
    }),
    ApiOkResponse({ description: 'Usuarios obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron usuarios registrados' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function updateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un usuario',
      description: 'Actualiza un usuario en el sistema',
    }),
    ApiNoContentResponse({ description: 'Usuario actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el usuario o el rol con el id proporcionado' }),
    ApiConflictResponse({ description: 'Email ya esta en uso o el rol esta inactivo o no existe' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function deleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina un usuario',
      description: 'Elimina un usuario en el sistema',
    }),
    ApiNoContentResponse({ description: 'Usuario eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el usuario con el id proporcionado' }),
    ApiConflictResponse({ description: 'El usuario ya esta inactivo. No puede ser eliminado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

function restoreUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura un usuario',
      description: 'Restaura un usuario en el sistema',
    }),
    ApiNoContentResponse({ description: 'Usuario restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el usuario con el id proporcionado' }),
    ApiConflictResponse({ description: 'El usuario ya esta activo. No puede ser restaurado nuevamente.' }),
    ApiBadRequestResponse({ description: 'Formato de datos incorrecto' }),
  );
}

export default {
  createUser,
  findAllUsers,
  updateUser,
  deleteUser,
  restoreUser,
};
