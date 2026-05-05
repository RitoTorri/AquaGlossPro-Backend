import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CombosDto {
  @IsNotEmpty({ message: 'El id del empleado es obligatorio' })
  @IsInt({ message: 'El id del empleado debe de ser un número' })
  @Min(1, { message: 'El id del empleado debe de ser mayor a 0' })
  employeeId: number;

  @IsNotEmpty({ message: 'El id del servicio es obligatorio' })
  @IsInt({ message: 'El id del servicio debe de ser un número' })
  @Min(1, { message: 'El id del servicio debe de ser mayor a 0' })
  serviceTypeVehicleId: number;

  @IsOptional()
  @IsInt({ message: 'El id del combo debe de ser un número' })
  @Min(1, { message: 'El id del combo debe de ser mayor a 0' })
  comboOriginId?: number;

  @IsOptional()
  @IsInt({ message: 'El descuento debe de ser un número entero' })
  @Min(0, { message: 'El descuento debe de ser mayor o igual a 0' })
  @Max(100, { message: 'El descuento debe de ser menor o igual a 100' })
  discount?: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben de ser un texto' })
  @MaxLength(255, { message: 'Las notas deben de tener menos de 255 caracteres' })
  notes?: string;
}
