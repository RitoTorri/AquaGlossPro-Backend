import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse, ApiCreatedResponse } from '@nestjs/swagger';

function ApiCreatedVehicleDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear un nuevo vehiculo',
            description: 'Crea un nuevo vehiculo con los datos proporcionados.',
        }),
        ApiCreatedResponse({ description: 'Vehiculo creado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un tipo de vehiculo o cliente con ese ID' }),
        ApiConflictResponse({ description: 'La placa del vehiculo ya esta en uso' }),
    );
}

function ApiFindVehiclesDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Obtener todos los vehiculos',
            description: 'Filtra vehiculos por estado activo, placa, tipo de vehiculo o cliente.',
        }),
        ApiOkResponse({ description: 'Vehiculos obtenidos exitosamente' }),
        ApiNotFoundResponse({ description: 'No hay vehiculos para mostrar' }),
    );
}

function ApiUpdateVehicleDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualizar un vehiculo',
            description: 'Actualiza un vehiculo con los datos proporcionados.',
        }),
        ApiNoContentResponse({ description: 'Vehiculo actualizado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un vehiculo, tipo de vehiculo o cliente con ese ID' }),
        ApiConflictResponse({ description: 'La placa del vehiculo ya esta en uso' }),
    );
}

function ApiRestoreVehicleDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Restaurar un vehiculo',
            description: 'Restaura un vehiculo con el ID proporcionado.',
        }),
        ApiNoContentResponse({ description: 'Vehiculo restaurado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un vehiculo con ese ID' }),
        ApiConflictResponse({ description: 'El vehiculo ya esta activo' }),
    );
}

function ApiRemoveVehicleDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Eliminar un vehiculo',
            description: 'Elimina un vehiculo con el ID proporcionado.',
        }),
        ApiNoContentResponse({ description: 'Vehiculo eliminado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontro un vehiculo con ese ID' }),
        ApiConflictResponse({ description: 'El vehiculo esta inactivo' }),
    );
}

export default {
    ApiCreatedVehicleDoc,
    ApiFindVehiclesDoc,
    ApiUpdateVehicleDoc,
    ApiRestoreVehicleDoc,
    ApiRemoveVehicleDoc
};