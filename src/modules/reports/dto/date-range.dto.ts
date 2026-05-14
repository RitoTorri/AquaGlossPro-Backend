import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum Period {
    TODAY = 'today',
    WEEK = 'week',
    MONTH = 'month',
    CUSTOM = 'custom',
}

export class DateRangeDto {
    @ApiPropertyOptional({ enum: Period, default: Period.TODAY })
    @IsEnum(Period)
    @IsOptional()
    period?: Period = Period.TODAY;

    @ApiPropertyOptional({ example: '2026-04-01' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-04-30' })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}