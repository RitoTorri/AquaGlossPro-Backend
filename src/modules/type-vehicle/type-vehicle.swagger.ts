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

function createTypeVehicle() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo tipo de vehículo',
      description: 'Crea un nuevo tipo de vehículo en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Tipo de vehículo creado exitosamente' }),
    ApiConflictResponse({ description: 'El nombre del tipo de vehículo ya existe' }),
    ApiBadRequestResponse({ description: 'El nombre del tipo de vehículo es requerido' }),
  );
}

function findAllTypeVehicles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista de tipos de vehículos',
      description: 'Obtiene la lista de tipos de vehículos filtrados por nombre, estado o obtener todos.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Tipos de vehículos obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontraron tipos de vehículos' }),
    ApiBadRequestResponse({ description: 'El nombre del tipo de vehículo es requerido' }),
  );
}

function updateTypeVehicle() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un tipo de vehículo',
      description: 'Actualiza un tipo de vehículo en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Tipo de vehículo actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un tipo de vehículo con el ID proporcionado' }),
    ApiConflictResponse({ description: 'El nombre del tipo de vehículo ya existe' }),
    ApiBadRequestResponse({ description: 'El nombre del tipo de vehículo es requerido' }),
  );
}

function deleteTypeVehicle() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina un tipo de vehículo',
      description: 'Elimina un tipo de vehículo en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Tipo de vehículo eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un tipo de vehículo con el ID proporcionado' }),
    ApiConflictResponse({ description: 'El tipo de vehículo ya esta inactivo. No puede ser eliminado nuevamente.' }),
    ApiBadRequestResponse({ description: 'El ID del tipo de vehículo es requerido' }),
  );
}

function restoreTypeVehicle() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaura un tipo de vehículo',
      description: 'Restaura un tipo de vehículo en el sistema',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Tipo de vehículo restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No existe un tipo de vehículo con el ID proporcionado' }),
    ApiConflictResponse({ description: 'El tipo de vehículo ya esta activo. No puede ser restaurado nuevamente.' }),
    ApiBadRequestResponse({ description: 'El ID del tipo de vehículo es requerido' }),
  );
}

export default {
  createTypeVehicle,
  findAllTypeVehicles,
  updateTypeVehicle,
  deleteTypeVehicle,
  restoreTypeVehicle,
};
