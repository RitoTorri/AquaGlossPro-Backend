import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';

export function ApiFindAllDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todas las comisiones',
      description: 'Filtra por nombre o cédula del empleado usando el parámetro "search".',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Comisiones obtenidas exitosamente' }),
    ApiNotFoundResponse({ description: 'No hay registros' }),
  );
}

export function ApiUpdateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar el estado de pago de una comisión' }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ description: 'Comisión actualizada exitosamente' }),
    ApiNotFoundResponse({ description: 'Empleado sin comisiones pendientes' }),
  );
}

export default {
    ApiFindAllDoc,
    ApiUpdateDoc,
}