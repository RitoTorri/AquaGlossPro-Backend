import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// dtos
import { CombosDto } from './combos.dto';

// enums
import { StatusPayments } from '../../../shared/enums/status-payments.enum';
import { StatusWashing } from '../../../shared/enums/status.washing';

export class CreateSaleDto {
  // Datos de la venta
  @ApiProperty({ description: 'ID del cliente', example: 1, minimum: 1 })
  @IsNotEmpty({ message: 'El id del cliente es obligatorio' })
  @IsInt({ message: 'El id del cliente debe de ser un número' })
  @Min(1, { message: 'El id del cliente debe de ser mayor a 0' })
  clientId: number;

  @ApiProperty({ description: 'ID del vehículo', example: 1, minimum: 1 })
  @IsNotEmpty({ message: 'El id del vehículo es obligatorio' })
  @IsInt({ message: 'El id del vehículo debe de ser un número' })
  @Min(1, { message: 'El id del vehículo debe de ser mayor a 0' })
  vehicleId: number;

  @ApiProperty({ description: 'ID del método de pago', example: 1, minimum: 1 })
  @IsNotEmpty({ message: 'El id del método de pago es obligatorio' })
  @IsInt({ message: 'El id del método de pago debe de ser un número' })
  @Min(1, { message: 'El id del método de pago debe de ser mayor a 0' })
  paymentMethodId: number;

  @ApiProperty({
    example: 'Vehiculo con golpe en el parabrisas.',
    description: 'Descripcion estado inical del vehiculo.',
  })
  @IsOptional()
  initialState: string | null;

  @ApiProperty({
    example: [
      {
        employeeId: 'Id del empleado que realiza el servicio',
        serviceTypeVehicleId: 'Id del servicio del combo',
        comboOriginId: 'Id del combo (Opcional)',
        discount: 'Descuento del combo (Opcional)',
        notes: 'Notas del servicio que hizo el empleado (Opcional)',
      },
    ],
    description: 'Lista de combos que se estan vendiendo',
    type: [CombosDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CombosDto)
  services: [CombosDto] | null;
}
