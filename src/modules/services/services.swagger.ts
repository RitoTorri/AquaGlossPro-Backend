import { applyDecorators } from '@nestjs/common/decorators';
import {
  ApiOperation,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

function createServiceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo servicio', description: 'Crear un nuevo servicio en la base de datos' }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Servicio creado exitosamente' }),
    ApiBadRequestResponse({ description: 'Datos de servicio inválidos' }),
    ApiConflictResponse({ description: 'Ya existe un servicio con ese nombre' }),
  );
}

function findAllServicesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar servicios',
      description: 'Permite busqueda filtrada por nombres de los servicios.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Servicios obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron servicios' }),
    ApiBadRequestResponse({ description: 'Datos de paginación inválidos' }),
  );
}

function updateServiceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un servicio', description: 'Actualizar un servicio en la base de datos' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Servicio actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el servicio' }),
    ApiConflictResponse({ description: 'Ya existe un servicio con ese nombre' }),
    ApiBadRequestResponse({ description: 'Datos de servicio inválidos' }),
  );
}

function restoreServiceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Restaurar un servicio', description: 'Restaurar un servicio en la base de datos' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Servicio restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el servicio' }),
    ApiConflictResponse({ description: 'El servicio ya está activo' }),
    ApiBadRequestResponse({ description: 'Datos de servicio inválidos' }),
  );
}

function removeServiceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un servicio', description: 'Eliminar un servicio en la base de datos' }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Servicio eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontró el servicio' }),
    ApiConflictResponse({ description: 'El servicio ya está inactivo' }),
    ApiBadRequestResponse({ description: 'Datos de servicio inválidos' }),
  );
}

export default {
  createServiceSwagger,
  findAllServicesSwagger,
  updateServiceSwagger,
  restoreServiceSwagger,
  removeServiceSwagger,
};
