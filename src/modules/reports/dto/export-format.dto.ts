import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'xlsx',
}

export class ExportFormatDto {
  @ApiProperty({ enum: ExportFormat, default: ExportFormat.PDF })
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.PDF;
}