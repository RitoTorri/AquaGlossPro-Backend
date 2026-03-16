import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse } from '@nestjs/swagger';

function createCategory() {
    return applyDecorators(
        ApiOperation({
            summary: 'Crear una nueva categoría',
            description: 'Crea una nueva categoría en el sistema'
        }),
        ApiCreatedResponse({ description: 'Categoría creada exitosamente' }),
        ApiConflictResponse({ description: 'Nombre de la categoría ya existe' }),
        ApiNotFoundResponse({ description: 'Nombre de la categoría no encontrado' })
    );
}

function findAllCategories() {
    return applyDecorators(
        ApiOperation({
            summary: 'Lista de categorías',
            description: 'Obtiene la lista de categorías filtradas por nombres, estado o obtener todos.'
        }),
        ApiOkResponse({ description: 'Categorías obtenidas exitosamente' }),
        ApiNotFoundResponse({ description: 'No se encontraron categorías' })
    );
}

function updateCategory() {
    return applyDecorators(
        ApiOperation({
            summary: 'Actualiza una categoría',
            description: 'Actualiza una categoría en el sistema'
        }),
        ApiNoContentResponse({ description: 'Categoría actualizada exitosamente' }),
        ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
        ApiConflictResponse({ description: 'Nombre de la categoría ya existe' })
    );
}

function deleteCategory() {
    return applyDecorators(
        ApiOperation({
            summary: 'Elimina una categoría',
            description: 'Elimina una categoría en el sistema'
        }),
        ApiNoContentResponse({ description: 'Categoría eliminada exitosamente' }),
        ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
        ApiConflictResponse({ description: 'Categoría ya esta inactiva. No puede ser eliminada nuevamente.' })
    );
}

function restoreCategory() {
    return applyDecorators(
        ApiOperation({
            summary: 'Restaura una categoría',
            description: 'Restaura una categoría en el sistema'
        }),
        ApiNoContentResponse({ description: 'Categoría restaurada exitosamente' }),
        ApiNotFoundResponse({ description: 'Categoría no encontrada o no existe' }),
        ApiConflictResponse({ description: 'Categoría ya esta activa. No puede ser restaurada nuevamente.' })
    );
}

export default {
    createCategory,
    findAllCategories,
    updateCategory,
    deleteCategory,
    restoreCategory
}