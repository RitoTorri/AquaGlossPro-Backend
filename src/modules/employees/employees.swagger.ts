import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse, ApiCreatedResponse } from '@nestjs/swagger';

function ApiFindEmployeesDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Obtener todos los empleados',
            description: 'Filtra empleados por estado activo, nombre, apellido o cédula.',
        }),
        ApiOkResponse({ description: 'Empleados obtenidos exitosamente' }),
        ApiNotFoundResponse({ description: 'No hay empleados para mostrar' }),
    );
}

function ApiCreateEmployeeDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear un nuevo empleado',
            description: 'Crea un nuevo empleado con los datos proporcionados.',
        }),
        ApiCreatedResponse({ description: 'Empleado creado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un puesto de trabajo con ese ID' }),
        ApiConflictResponse({ description: 'El email, telefono o cédula ya esta en uso' }),
    );
}

function ApiUpdateEmployeeDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualizar un empleado',
            description: 'Actualiza un empleado con los datos proporcionados.',
        }),
        ApiNoContentResponse({ description: 'Empleado actualizado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un empleado o job con ese ID' }),
        ApiConflictResponse({ description: 'El email, telefono o cédula ya esta en uso' }),
    );
}

function ApiRemoveEmployeeDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Eliminar un empleado',
            description: 'Elimina un empleado con el ID proporcionado.',
        }),
        ApiNoContentResponse({ description: 'Empleado eliminado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un empleado con ese ID' }),
        ApiConflictResponse({ description: 'El empleado está inactivo' }),
    );
}

function ApiRestoreEmployeeDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Restaurar un empleado',
            description: 'Restaura un empleado con el ID proporcionado.',
        }),
        ApiNoContentResponse({ description: 'Empleado restaurado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un empleado con ese ID' }),
        ApiConflictResponse({ description: 'El empleado está activo' }),
    );
}

export default { ApiFindEmployeesDoc, ApiCreateEmployeeDoc, ApiUpdateEmployeeDoc, ApiRemoveEmployeeDoc, ApiRestoreEmployeeDoc };