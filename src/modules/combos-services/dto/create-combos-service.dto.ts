import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateCombosServiceDto {
    @ApiProperty({ example: 1, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    comboId: number;

    @ApiProperty({ example: 1, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    servicesTypeVehicleId: number;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}