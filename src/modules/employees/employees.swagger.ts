import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

function ApiFindEmployeesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los empleados',
      description: 'Filtra empleados por estado activo, nombre, apellido o cédula.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Empleados obtenidos exitosamente' }),
    ApiNotFoundResponse({ description: 'No hay empleados para mostrar' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function ApiCreateEmployeeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo empleado',
      description: 'Crea un nuevo empleado con los datos proporcionados.',
    }),
    ApiBearerAuth('access-token'),
    ApiCreatedResponse({ description: 'Empleado creado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontro un puesto de trabajo con ese ID' }),
    ApiConflictResponse({ description: 'El email, telefono o cédula ya esta en uso' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function ApiUpdateEmployeeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un empleado',
      description: 'Actualiza un empleado con los datos proporcionados.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Empleado actualizado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontro un empleado o job con ese ID' }),
    ApiConflictResponse({ description: 'El email, telefono o cédula ya esta en uso' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function ApiRemoveEmployeeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un empleado',
      description: 'Elimina un empleado con el ID proporcionado.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Empleado eliminado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontro un empleado con ese ID' }),
    ApiConflictResponse({ description: 'El empleado está inactivo' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

function ApiRestoreEmployeeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restaurar un empleado',
      description: 'Restaura un empleado con el ID proporcionado.',
    }),
    ApiBearerAuth('access-token'),
    ApiNoContentResponse({ description: 'Empleado restaurado exitosamente' }),
    ApiNotFoundResponse({ description: 'No se encontro un empleado con ese ID' }),
    ApiConflictResponse({ description: 'El empleado está activo' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o formato incorrecto' }),
  );
}

export default {
  ApiFindEmployeesDoc,
  ApiCreateEmployeeDoc,
  ApiUpdateEmployeeDoc,
  ApiRemoveEmployeeDoc,
  ApiRestoreEmployeeDoc,
};
