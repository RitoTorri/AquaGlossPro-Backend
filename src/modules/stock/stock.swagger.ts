import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

function updateStockSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar stock de productos',
      description: 'Actualizar stock de productos en la base de datos',
    }),
    ApiBearerAuth('access-token'),
    ApiNotFoundResponse({ description: 'No se encontró el producto' }),
    ApiBadRequestResponse({ description: 'Datos de producto inválidos' }),
    ApiInternalServerErrorResponse({ description: 'Error interno del servidor' }),
  );
}

export default {
  updateStockSwagger,
};
