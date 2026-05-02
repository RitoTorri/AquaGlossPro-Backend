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

function createSale() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una venta',
      description: 'Crea una venta en el sistema',
    }),
  );
}

export default {
  createSale,
};