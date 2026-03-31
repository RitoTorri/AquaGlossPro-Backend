import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

function createdModule() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear un nuevo módulo',
            description: 'Crea un nuevo módulo en el sistema',
        }),
        ApiCreatedResponse({ description: 'Módulo creado exitosamente' }),
        ApiConflictResponse({ description: 'El módulo ya existe' })
    );
}

function findAllModules() {
    return applyDecorators(
        ApiOperation({
            summary: 'Lista de módulos',
            description: 'Obtiene la lista de módulos',
        }),
        ApiOkResponse({ description: 'Módulos obtenidos exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontraron módulos registrados' })
    );
}

function updateModule() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualiza un módulo',
            description: 'Actualiza un módulo en el sistema',
        }),
        ApiNoContentResponse({ description: 'Módulo actualizado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontró el módulo con el id proporcionado' }),
        ApiConflictResponse({ description: 'El módulo ya existe' })
    );
}

function restoreModule() {
    return applyDecorators(
        ApiOperation({
            summary: 'Restaura un módulo',
            description: 'Restaura un módulo en el sistema',
        }),
        ApiNoContentResponse({ description: 'Módulo restaurado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontró el módulo con el id proporcionado' }),
        ApiConflictResponse({ description: 'El módulo ya esta activo. No puede ser restaurado nuevamente.' })
    );
}

function deleteModule() {
    return applyDecorators(
        ApiOperation({
            summary: 'Elimina un módulo',
            description: 'Elimina un módulo en el sistema',
        }),
        ApiNoContentResponse({ description: 'Módulo eliminado exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontró el módulo con el id proporcionado' }),
        ApiConflictResponse({ description: 'El módulo ya esta inactivo. No puede ser eliminado nuevamente.' })
    );
}

export default {
    createdModule,
    findAllModules,
    updateModule,
    restoreModule,
    deleteModule
}
