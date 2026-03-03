import { IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // <--- Importante

export class PaginationDto {
    @ApiPropertyOptional({ default: true, type: Boolean })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value; // Si ya es boolean (por default), lo deja pasar
    })
    @IsBoolean() // Esto validará que DESPUÉS del Transform, sea un booleano
    active;

    @ApiPropertyOptional({
        default: 1,
        description: 'Número de la página'
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @ApiPropertyOptional({
        default: 10,
        maximum: 100,
        description: 'Cantidad de registros por página'
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit: number = 10;
}