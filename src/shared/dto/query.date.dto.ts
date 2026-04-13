import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export class QueryDateDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido (ISO 8601)' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del reporte (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido (ISO 8601)' })
  endDate?: string;
}