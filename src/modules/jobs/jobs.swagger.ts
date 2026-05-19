import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

function CreateJob() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo puesto', description: 'Permite crear un nuevo puesto de trabajo' }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Puesto creado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
    ApiConflictResponse({ description: 'El puesto ya existe' }),
  );
}

function FindJobs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los puestos',
      description: 'Permite obtener todos los puestos de trabajo. Se puede buscar por nombre',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Puestos obtenidos exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
    ApiNotFoundResponse({ description: 'No se encontraron puestos' }),
  );
}

function UpdateJob() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un puesto', description: 'Permite actualizar un puesto de trabajo' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Puesto actualizado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
    ApiConflictResponse({ description: 'Ya existe un puesto con el mismo nombre' }),
    ApiNotFoundResponse({ description: 'No se encontro el puesto con el id proporcionado' }),
  );
}

function RemoveJob() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un puesto', description: 'Permite eliminar un puesto de trabajo' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Puesto eliminado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
    ApiNotFoundResponse({ description: 'No se encontro el puesto con el id proporcionado' }),
    ApiConflictResponse({ description: 'El puesto ya esta inactivo' }),
  );
}

function RestoreJob() {
  return applyDecorators(
    ApiOperation({ summary: 'Restaurar un puesto', description: 'Permite restaurar un puesto de trabajo' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Puesto restaurado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
    ApiNotFoundResponse({ description: 'No se encontro el puesto con el id proporcionado' }),
    ApiConflictResponse({ description: 'El puesto ya esta activo' }),
  );
}

export default {
  CreateJob,
  FindJobs,
  UpdateJob,
  RemoveJob,
  RestoreJob,
};
